require "formula"

class Mymyip < Formula
  homepage "https://github.com/kitsuyui/myip"
  head "https://github.com/kitsuyui/myip.git"
  version "v0.3.8"

  if Hardware::CPU.arm? and Hardware::CPU.is_64_bit?
    url "https://github.com/kitsuyui/myip/releases/download/v0.3.8/myip_0.3.8_darwin_arm64.tar.gz"
    sha256 "7d82590771b750c934d955e9bcbd9505fd45f028ef31f876c3d25c6056cee362"
  elsif Hardware::CPU.intel? and Hardware::CPU.is_64_bit?
    url "https://github.com/kitsuyui/myip/releases/download/v0.3.8/myip_0.3.8_darwin_amd64.tar.gz"
    sha256 "c4808bc2258dfc77ca138e0b8feeac1c7cec40c5b0d962ec4a1ccb7e02d1cd7b"
  end

  def install
    bin.install "myip" => "mymyip"
  end
end
