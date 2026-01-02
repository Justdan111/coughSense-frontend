import { Activity } from "lucide-react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-8 md:mb-12">
          <div className="sm:col-span-2">
            <div className="flex items-center gap-2 mb-4 md:mb-6 text-white">
              <Activity className="w-6 h-6 text-brand-teal" />
              <span className="font-bold text-lg md:text-xl">CoughSense</span>
            </div>
            <p className="max-w-sm leading-relaxed text-slate-400 text-sm md:text-base">
              AI-powered cough triage tool for early respiratory risk awareness. Providing accessible risk assessment to help you make informed health decisions.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 md:mb-4 text-sm md:text-base">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#how-it-works" className="hover:text-brand-teal transition-colors">
                  How it Works
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-brand-teal transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-brand-teal transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 md:mb-4 text-sm md:text-base">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-brand-teal transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-brand-teal transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="pt-6 md:pt-8 border-t border-slate-800 text-xs md:text-sm text-slate-500 flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4 text-center md:text-left">
          <p>© {new Date().getFullYear()}{" "} CoughSense. All rights reserved.</p>
          <p className="italic">For informational purposes only. Not a medical diagnosis.</p>
        </div>
      </div>
    </footer>
  )
}
