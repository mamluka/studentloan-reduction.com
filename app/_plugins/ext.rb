#require 'jekyll_image_encode'

module ImageEncodeCache
  @@cached_base64_codes = Hash.new

  def cached_base64_codes
    @@cached_base64_codes
  end

  def cached_base64_codes= val
    @@cached_base64_codes = val
  end
end

module Jekyll
  module Base64Filter
    include ImageEncodeCache

    def base64(input)
        encode_image input
    end

    def encode_image(url)
            require 'open-uri'
            require 'base64'

            encoded_image = ''

            if self.cached_base64_codes.has_key? url
              encoded_image = self.cached_base64_codes[url]
            else
              # p "Caching #{url} as local base64 string ..."
              open(url) do |image|
                encoded_image = Base64.strict_encode64(image.read)
              end
              self.cached_base64_codes.merge!(url => encoded_image)
            end

            "data:image;base64, #{encoded_image}"
          end
  end
end

Liquid::Template.register_filter(Jekyll::Base64Filter)