import Link from 'next/link'
import {IoMdCalculator} from 'react-icons/io'
import Header from '../components/Header'

export default function Home() {
    return (
        <div className="min-h-screen bg-background text-foreground pt-16 p-8">
            <Header/>

            <div className="
        grid
        grid-cols-[repeat(auto-fit,_minmax(200px,_1fr))]
        gap-8
      ">
                <Link
                    href="/math"
                    className="
            flex flex-col items-center justify-center
            p-6 bg-white dark:bg-gray-800
            rounded-2xl shadow-card
            hover:scale-[1.02] transition-transform
          "
                >
                    <IoMdCalculator className="text-primary" size={128}/>
                    <span className="mt-4 text-2xl font-medium">Math Solver</span>
                </Link>

                {/* future tiles auto-wrap */}
            </div>
        </div>
    )
}
