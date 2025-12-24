import Link from "next/link"
import { Sun, Zap, Shield, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center">
              <Sun className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-semibold text-foreground">CEB Solar</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#about" className="text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
            <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors">
              Login
            </Link>
            <Link href="/register">
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-500 text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            Ceylon Electricity Board - Solar Installation Portal
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
            Power Your Future with Solar Energy
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
            Apply for solar installation, track your application status, and manage your solar energy system - all in
            one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white px-8">
                Apply Now
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="px-8 bg-transparent">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 bg-muted/50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">For All Users</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl bg-card border border-border">
              <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-emerald-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Customers</h3>
              <p className="text-muted-foreground">
                Apply for solar installation, upload documents, select packages, and track your application progress.
              </p>
              <Link
                href="/register?role=customer"
                className="inline-block mt-4 text-emerald-500 hover:text-emerald-600 font-medium"
              >
                Register as Customer →
              </Link>
            </div>
            <div className="p-6 rounded-xl bg-card border border-border">
              <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-amber-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">Installers</h3>
              <p className="text-muted-foreground">
                Register your company, get verified, create solar packages, and bid on customer installations.
              </p>
              <Link
                href="/register?role=installer"
                className="inline-block mt-4 text-amber-500 hover:text-amber-600 font-medium"
              >
                Register as Installer →
              </Link>
            </div>
            <div className="p-6 rounded-xl bg-card border border-border">
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-foreground">CEB Officers</h3>
              <p className="text-muted-foreground">
                Review applications, verify installers, schedule site visits, and manage billing.
              </p>
              <Link href="/login" className="inline-block mt-4 text-blue-500 hover:text-blue-600 font-medium">
                Officer Login →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>© 2025 Ceylon Electricity Board. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
