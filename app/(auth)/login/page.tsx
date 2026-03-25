
  // "use client"
  // import { LoginForm } from "@/components/login-form"
  // import Image from "next/image"

  // export default function LoginPage() {
  //   return (
  //     <div className="grid min-h-svh lg:grid-cols-2">
  //       <div className="flex flex-col gap-4 p-6 md:p-10">
  //         <div className="flex justify-center gap-2 md:justify-start">
  //           <a href="#" className="flex items-center gap-2 font-medium">
  //             <div className="flex items-center justify-center">
  //               <Image
  //                 src="/logo.png"
  //                 alt="Logo"
  //                 width={120}
  //                 height={40}
  //                 className="object-contain"
  //                 priority
  //               />
  //             </div>
  //           </a>    
  //         </div>
  //         <div className="flex flex-1 items-center justify-center">
  //           <div className="w-full max-w-xs">
  //             <LoginForm />
  //           </div>
  //         </div>
  //       </div>
  //       <div className="relative hidden lg:flex items-center justify-center bg-muted overflow-hidden">
  //         <Image
  //           src="/finanza.png"
  //           alt="Finanza App"
  //           fill
  //           className="object-contain p-10 dark:brightness-[0.2] dark:grayscale"
  //         />
  //     </div>
  //     </div>
  //   )
  // }
"use client"
import { LoginForm } from "@/components/login-form"
import Image from "next/image"

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-[3fr_2fr]">
      <div className="relative hidden lg:flex items-center justify-center bg-muted overflow-hidden">
        <Image
          src="/finanza.png"
          alt="Finanza App"
          fill
          className="object-contain p-10 dark:brightness-[0.2] dark:grayscale"
        />
      </div>
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="Logo"
                width={120}
                height={40}
                className="object-contain"
                priority
              />
            </div>
          </a>    
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  )
}
