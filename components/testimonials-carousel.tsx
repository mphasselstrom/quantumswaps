'use client'

import { useState, useRef, useEffect } from 'react'
import { Transition } from '@headlessui/react'
import Image from 'next/image'
import Highlighter, { HighlighterItem } from './highlighter'

import Image01 from '@/public/images/testimonial-01.jpg'
import Image02 from '@/public/images/testimonial-02.jpg'
import Image03 from '@/public/images/testimonial-03.jpg'
import Image04 from '@/public/images/testimonial-04.jpg'
import Image05 from '@/public/images/testimonial-05.jpg'
import Image06 from '@/public/images/testimonial-06.jpg'
import Image07 from '@/public/images/testimonial-07.jpg'
import Image08 from '@/public/images/testimonial-08.jpg'
import Image09 from '@/public/images/testimonial-09.jpg'

// Import Swiper
import Swiper, { Navigation } from 'swiper'
import 'swiper/swiper.min.css'
Swiper.use([Navigation])

export default function TestimonialsCarousel() {
  const [swiperInitialized, setSwiperInitialized] = useState<boolean>(false)

  const [active, setActive] = useState<number>(0)
  const [autorotate, setAutorotate] = useState<boolean>(true)
  const [autorotateTiming] = useState<number>(7000)
  const [items] = useState<number[]>([
    0, 1, 2, 3, 4, 5, 6, 7, 8
  ])

  const carousel = useRef<HTMLDivElement>(null)
  const carouselNext = useRef<HTMLButtonElement>(null)
  const carouselPrev = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const swiper = new Swiper(carousel.current!, {
      slidesPerView: 'auto',
      grabCursor: true,
      loop: true,
      centeredSlides: true,
      initialSlide: 0,
      spaceBetween: 24,
      navigation: {
        nextEl: '.carousel-next',
        prevEl: '.carousel-prev',
      },
    })
    setSwiperInitialized(true)
  }, [])

  return (
    <section>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="pt-12 md:pt-20">

          {/* Section header */}
          <div className="max-w-3xl mx-auto text-center pb-12 md:pb-20">
            <h2 className="h2 bg-clip-text text-transparent bg-linear-to-r from-slate-200/60 via-slate-200 to-slate-200/60 pb-4">What our users are saying</h2>
            <p className="text-lg text-slate-400">Discover how crypto wallets and dApps are enhancing their offerings with our seamless swap integration.</p>
          </div>

          {/* Carousel built with Swiper.js [https://swiperjs.com/] */}
          {/* * Custom styles in src/css/additional-styles/theme.scss */}
          <div className="relative before:absolute before:inset-0 before:-translate-x-full before:z-20 before:bg-linear-to-l before:from-transparent before:to-slate-900 before:to-20% after:absolute after:inset-0 after:translate-x-full after:z-20 after:bg-linear-to-r after:from-transparent after:to-slate-900 after:to-20%">
            <div className="stellar-carousel swiper-container group">
              <Highlighter className="swiper-wrapper w-fit" refresh={swiperInitialized}>
                {/* Carousel items */}
                <HighlighterItem className="swiper-slide h-auto group/slide">
                  <div className="relative h-full bg-slate-900 rounded-[inherit] z-20 overflow-hidden">
                    {/* Particles animation */}
                    <div className="absolute inset-0 -z-10 opacity-0 group-[.swiper-slide-active]/slide:opacity-100 group-hover/slide:opacity-100 transition-opacity duration-500 ease-in-out">
                      <div className="particles-js h-full" id="particles-js-1"></div>
                    </div>
                    <div className="flex flex-col p-6 h-full">
                      <div className="grow">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="relative">
                              <Image className="rounded-full" src={Image01} width={48} height={48} alt="Testimonial 01" />
                              <svg className="absolute top-0 right-0 -mr-3 w-8 h-8 fill-purple-500" xmlns="http://www.w3.org/2000/svg">
                                <path d="M19.765 8.047a.774.774 0 0 0-.437-.46c-.626-.304-3.414.278-4.828.315-1.026.027-2.207-.409-2.773-.936-.702-.657-2.364-1.504-1.46-2.358.363-.343 1.704.992 4.206-1.345 1.228-1.147.978-3.906-.32-4.723-.925-.58-2.162-.773-3.378-.334C6.682.126 6.11 4.224 6.028 4.224c-.09 0-1.243-2.25-3.06-2.523C1.877 1.578.962 1.92.433 2.492c-1.301 1.409-.128 4.486 2.555 8.056 2.738 3.637 6.256 6.973 7.596 6.973.615 0 2.756-2.07 4.688-4.243 1.236-1.394 3.063-3.61 4.06-5.065.438-.63.818-1.177 1.087-1.28a.558.558 0 0 0 .343-.552.774.774 0 0 0-.997-.334Z" />
                              </svg>
                            </div>
                            <div className="font-bold text-slate-100">Mark Varsano</div>
                          </div>
                          <div className="flex space-x-3">
                            <div className="text-yellow-500">★</div>
                            <div className="text-yellow-500">★</div>
                            <div className="text-yellow-500">★</div>
                            <div className="text-yellow-500">★</div>
                            <div className="text-yellow-500">★</div>
                          </div>
                        </div>
                        <p className="text-slate-400 mb-8">The quick, brown fox jumps over a lazy dog. DJs flock by when MTV ax quiz prog. Junk MTV quiz graced by fox whelps.</p>
                      </div>
                      <div className="text-right">
                        <a className="text-sm font-medium text-slate-300 hover:text-white inline-flex items-center transition duration-150 ease-in-out group" href="#0">Learn More <span className="tracking-normal text-purple-500 group-hover:translate-x-0.5 transition-transform duration-150 ease-in-out ml-1">-&gt;</span></a>
                      </div>
                    </div>
                  </div>
                </HighlighterItem>
                <HighlighterItem className="swiper-slide h-auto group/slide">
                  <div className="relative h-full bg-slate-900 rounded-[inherit] z-20 overflow-hidden">
                    {/* Particles animation */}
                    <div className="absolute inset-0 -z-10 opacity-0 group-[.swiper-slide-active]/slide:opacity-100 group-hover/slide:opacity-100 transition-opacity duration-500 ease-in-out">
                      <div className="particles-js h-full" id="particles-js-2"></div>
                    </div>
                    <div className="flex flex-col p-6 h-full">
                      <div className="grow">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="relative">
                              <Image className="rounded-full" src={Image02} width={48} height={48} alt="Testimonial 02" />
                              <svg className="absolute top-0 right-0 -mr-3 w-8 h-8 fill-purple-500" xmlns="http://www.w3.org/2000/svg">
                                <path d="M19.765 8.047a.774.774 0 0 0-.437-.46c-.626-.304-3.414.278-4.828.315-1.026.027-2.207-.409-2.773-.936-.702-.657-2.364-1.504-1.46-2.358.363-.343 1.704.992 4.206-1.345 1.228-1.147.978-3.906-.32-4.723-.925-.58-2.162-.773-3.378-.334C6.682.126 6.11 4.224 6.028 4.224c-.09 0-1.243-2.25-3.06-2.523C1.877 1.578.962 1.92.433 2.492c-1.301 1.409-.128 4.486 2.555 8.056 2.738 3.637 6.256 6.973 7.596 6.973.615 0 2.756-2.07 4.688-4.243 1.236-1.394 3.063-3.61 4.06-5.065.438-.63.818-1.177 1.087-1.28a.558.558 0 0 0 .343-.552.774.774 0 0 0-.997-.334Z" />
                              </svg>
                            </div>
                            <div className="font-bold text-slate-100">Patrick Cary</div>
                          </div>
                          <div className="flex space-x-3">
                            <div className="text-yellow-500">★</div>
                            <div className="text-yellow-500">★</div>
                            <div className="text-yellow-500">★</div>
                            <div className="text-yellow-500">★</div>
                            <div className="text-yellow-500">★</div>
                          </div>
                        </div>
                        <p className="text-slate-400 mb-8">The quick, brown fox jumps over a lazy dog. DJs flock by when MTV ax quiz prog. Junk MTV quiz graced by fox whelps.</p>
                      </div>
                      <div className="text-right">
                        <a className="text-sm font-medium text-slate-300 hover:text-white inline-flex items-center transition duration-150 ease-in-out group" href="#0">Learn More <span className="tracking-normal text-purple-500 group-hover:translate-x-0.5 transition-transform duration-150 ease-in-out ml-1">-&gt;</span></a>
                      </div>
                    </div>
                  </div>
                </HighlighterItem>
                <HighlighterItem className="swiper-slide h-auto group/slide">
                  <div className="relative h-full bg-slate-900 rounded-[inherit] z-20 overflow-hidden">
                    {/* Particles animation */}
                    <div className="absolute inset-0 -z-10 opacity-0 group-[.swiper-slide-active]/slide:opacity-100 group-hover/slide:opacity-100 transition-opacity duration-500 ease-in-out">
                      <div className="particles-js h-full" id="particles-js-3"></div>
                    </div>
                    <div className="flex flex-col p-6 h-full">
                      <div className="grow">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="relative">
                              <Image className="rounded-full" src={Image03} width={48} height={48} alt="Testimonial 03" />
                              <svg className="absolute top-0 right-0 -mr-3 w-8 h-8 fill-purple-500" xmlns="http://www.w3.org/2000/svg">
                                <path d="M19.765 8.047a.774.774 0 0 0-.437-.46c-.626-.304-3.414.278-4.828.315-1.026.027-2.207-.409-2.773-.936-.702-.657-2.364-1.504-1.46-2.358.363-.343 1.704.992 4.206-1.345 1.228-1.147.978-3.906-.32-4.723-.925-.58-2.162-.773-3.378-.334C6.682.126 6.11 4.224 6.028 4.224c-.09 0-1.243-2.25-3.06-2.523C1.877 1.578.962 1.92.433 2.492c-1.301 1.409-.128 4.486 2.555 8.056 2.738 3.637 6.256 6.973 7.596 6.973.615 0 2.756-2.07 4.688-4.243 1.236-1.394 3.063-3.61 4.06-5.065.438-.63.818-1.177 1.087-1.28a.558.558 0 0 0 .343-.552.774.774 0 0 0-.997-.334Z" />
                              </svg>
                            </div>
                            <div className="font-bold text-slate-100">Sean Doe</div>
                          </div>
                          <div className="flex space-x-3">
                            <div className="text-yellow-500">★</div>
                            <div className="text-yellow-500">★</div>
                            <div className="text-yellow-500">★</div>
                            <div className="text-yellow-500">★</div>
                            <div className="text-yellow-500">★</div>
                          </div>
                        </div>
                        <p className="text-slate-400 mb-8">The quick, brown fox jumps over a lazy dog. DJs flock by when MTV ax quiz prog. Junk MTV quiz graced by fox whelps.</p>
                      </div>
                      <div className="text-right">
                        <a className="text-sm font-medium text-slate-300 hover:text-white inline-flex items-center transition duration-150 ease-in-out group" href="#0">Learn More <span className="tracking-normal text-purple-500 group-hover:translate-x-0.5 transition-transform duration-150 ease-in-out ml-1">-&gt;</span></a>
                      </div>
                    </div>
                  </div>
                </HighlighterItem>
                {/* More testimonials */}
                {/* ... */}
              </Highlighter>
            </div>
          </div>

          {/* Arrows */}
          <div className="flex mt-8 justify-end">
            <button className="carousel-prev relative z-20 w-12 h-12 flex items-center justify-center group">
              <span className="sr-only">Previous</span>
              <svg className="w-4 h-4 fill-slate-500 group-hover:fill-purple-500 transition duration-150 ease-in-out" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.7 14.7l1.4-1.4L3.8 9H16V7H3.8l4.3-4.3-1.4-1.4L0 8z" />
              </svg>
            </button>
            <button className="carousel-next relative z-20 w-12 h-12 flex items-center justify-center group">
              <span className="sr-only">Next</span>
              <svg className="w-4 h-4 fill-slate-500 group-hover:fill-purple-500 transition duration-150 ease-in-out" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.3 14.7l-1.4-1.4L12.2 9H0V7h12.2L7.9 2.7l1.4-1.4L16 8z" />
              </svg>
            </button>
          </div>

        </div>
      </div>
    </section>
  )
}