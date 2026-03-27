import Image from "next/image"

export function AppFooter() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 flex h-10 items-center justify-between border-t bg-background px-4">
      {/* Left: favicon + company name */}
      <div className="flex items-center gap-2">
        <Image
          src="/logo_fav.png"
          alt="BridgeLogic"
          width={20}
          height={20}
          style={{ width: 20, height: "auto" }}
          className="object-contain"
        />
        <span className="text-xs text-muted-foreground">
          BridgeLogic Software Pvt. Ltd.
        </span>
      </div>

      {/* Right: company logo */}
      <Image
        src="/company-logo.png"
        alt="BridgeLogic Logo"
        width={90}
        height={24}
        style={{ width: 90, height: "auto", paddingBottom: '6px' }}
        className="object-contain"
      />
    </footer>
  )
}