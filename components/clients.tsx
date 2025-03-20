import Image from 'next/image'
import Particles from './particles'

// Stats for swaps API
const stats = [
  { value: "+700k", label: "Pairs" },
  { value: "150+", label: "Blockchains" },
  { value: "99.9%", label: "Uptime" },
  { value: "No", label: "KYC" },
  { value: "No", label: "Registration" },
  { value: "1.3%", label: "Fee" },
];

export default function Clients() {
  return (
    <section>
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">

        {/* Particles animation */}
        <div className="absolute inset-0 max-w-6xl mx-auto px-4 sm:px-6">
          <Particles className="absolute inset-0 -z-10" quantity={5} />
        </div>

        <div className="py-12 md:py-16">
          <div className="overflow-hidden">
            <div className="inline-flex w-full flex-nowrap overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
              <ul className="flex animate-infinite-scroll items-center justify-center md:justify-start [&_li]:mx-8">
                {stats.map((stat, index) => (
                  <li key={index} className="flex flex-col items-center">
                    <div className="font-bold text-3xl bg-clip-text text-transparent bg-linear-to-r from-purple-500 to-purple-200">{stat.value}</div>
                    <div className="text-slate-400 font-medium">{stat.label}</div>
                  </li>
                ))}
              </ul>
              <ul
                className="flex animate-infinite-scroll items-center justify-center md:justify-start [&_li]:mx-8"
                aria-hidden="true"
              >
                {stats.map((stat, index) => (
                  <li key={index} className="flex flex-col items-center">
                    <div className="font-bold text-3xl bg-clip-text text-transparent bg-linear-to-r from-purple-500 to-purple-200">{stat.value}</div>
                    <div className="text-slate-400 font-medium">{stat.label}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}