import { Link } from "react-router-dom";
import { useState } from "react";

export function Footer() {
  const [email, setEmail] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const columns = [
    {
      title: "COOL STUFF",
      items: ["ABOUT US", "BLOG", "SHOP ALL", "NEW ARRIVALS", "HATS AND CAPS", "APPAREL", "ACCESSORIES", "COLLABS", "REWARDS", "LOOP WAITLIST"],
    },
    {
      title: "BORING STUFF",
      items: ["TRACK US", "RETURNS"],
    },
    {
      title: "LEGAL",
      items: ["CONTACT", "SHIPPING", "RETURNS", "FAQ", "SIZE GUIDE"],
    },
    {
      title: "LET'S CONNECT",
      items: ["WHATSAPP", "EMAIL", "CONTACT US"],
    },
    {
      title: "STORE LOCATOR",
      items: ["MUMBAI", "BANGALORE"],
    },
  ];

  const popularSearches = [
    "shirts",
    "pants",
    "caps",
    "hoodies",
    "sneakers",
    "jackets",
    "socks",
    "beanies",
  ];

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    // Implement subscription logic or prop callback
    console.log("subscribe", email);
    setEmail("");
  }

  // Accordion state for mobile (<= 765px). single-open behavior

  function toggleIndex(i: number) {
    setOpenIndex((prev) => (prev === i ? null : i));
  }

  return (
    <div>

      {/* Footer */}
      <footer className="bg_varels_pink text-black">
        <div className="bg_varels_pink container mx-auto px-6 lg:px-4 py-5 md:py-12">

          {/* Newsletter section */}
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="font-antarctican text-sm md:text-xl font-semibold uppercase tracking-widest">
              Join the newsletter for exclusive updates
            </h3>
            <form
              onSubmit={handleSubscribe}
              className="font-antarctican font-normal mt-4 flex items-center justify-center"
              aria-label="Subscribe to newsletter"
            >
              <div className="relative w-full max-w-xl">

                {/* Left pill inside input */}
                <div className="absolute right-0 top-0 bottom-0 flex items-center">
                  <button
                    type="submit"
                    className="h-10 md:h-12 ml-1 mr-3 rounded-md bg-white/10 text-white px-3 md:px-4 text-sm md:text-base flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-white/60"
                  >
                    <span className="font-antarctican uppercase text-black font-light">Subscribe</span>
                    {/* arrow svg */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="black"
                      strokeWidth={4}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14" />
                      <path d="M12 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="YOUR EMAIL ADDRESS"
                  aria-label="Email address"
                  required
                  className="w-full text-xs md:text-sm font-normal text-black bg-white rounded-md py-3 pl-5 pr-4 shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/60"
                />
              </div>
            </form>
          </div>

          {/* Links area */}
          <div className="bg_varels_pink mt-5 grid grid-cols-1 gap-3 md:gap-6 md:grid-cols-3 lg:grid-cols-5">
            {columns.map((col, i) => (
              <div key={col.title} className="">

                {/* Mobile header row with toggle */}
                <div className="flex items-center justify-between md:block">
                  <h4 className="font-antarctican text-sm md:text-xl md:text-base lg:text-xl font-normal uppercase mb-3">
                    {col.title}
                  </h4>

                  {/* toggle button only visible on mobile */}
                  <button
                    type="button"
                    aria-expanded={openIndex === i}
                    aria-controls={`col-${i}`}
                    onClick={() => toggleIndex(i)}
                    className="md:hidden ml-2 p-2 rounded-full bg-white/10"
                    aria-label={`Toggle ${col.title}`}
                  >
                    <span className={`block text-black transform transition-transform ${openIndex === i ? 'rotate-45' : ''}`}>
                      +
                    </span>
                  </button>
                </div>

                {/* List - collapsed on mobile, visible on md+ */}
                <ul
                  id={`col-${i}`}
                  aria-hidden={openIndex !== i}
                  className={`overflow-hidden transition-[max-height] duration-300 md:visible md:max-h-full ${openIndex === i ? 'max-h-48 pb-2' : 'max-h-0'} md:block md:mt-0 mt-1`}
                >
                  {col.items.map((item) => (
                    <li key={item}>
                      <Link to="#" className="font-antarctican= text-sm md:text-sm lg:text-lg font-light opacity-90 hover:underline block py-1">
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
                
              </div>
            ))}

            {/* Social + Popular searches column (uses last grid column space) */}
            <div>
              <h4 className="font-antarctican text-sm md:text-xl  font-semibold uppercase tracking-widest text-center md:text-left mb-3">
                Social media
              </h4>

              {/* Simple svg icons with accessible labels */}
              <div className="flex items-center gap-3 mb-6 md:mb-8 justify-center md:justify-start">
                <a
                  href="#"
                  aria-label="Facebook"
                  className="text-black/70 hover:text-black/90 transform hover:scale-105"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5 text-black/70"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path d="M22 12c0-5.522-4.478-10-10-10S2 6.478 2 12c0 4.99 3.657 9.128 8.438 9.878v-6.99H7.898v-2.888h2.54V9.845c0-2.507 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562v1.875h2.773l-.443 2.888h-2.33v6.99C18.343 21.128 22 16.99 22 12z" />
                  </svg>
                </a>
                <a
                  href="#"
                  aria-label="Instagram"
                  className="text-black/70 hover:text-black/90 transform hover:scale-105"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5 text-black/70"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <rect x="2" y="2" width="20" height="20" rx="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <path d="M17.5 6.5h.01" />
                  </svg>
                </a>
                <a
                  href="#"
                  aria-label="Pinterest"
                  className="text-black/70 hover:text-black/90 transform hover:scale-105"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5 text-black/70"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.084 2.438 7.572 5.91 9.03-.082-.767-.157-1.945.033-2.784.17-.733 1.095-4.68 1.095-4.68s-.28-.558-.28-1.381c0-1.294.75-2.262 1.684-2.262.795 0 1.18.596 1.18 1.31 0 .798-.507 1.99-.77 3.095-.22.92.467 1.672 1.385 1.672 1.662 0 2.94-1.75 2.94-4.278 0-2.236-1.61-3.802-3.909-3.802-2.66 0-4.225 1.993-4.225 4.052 0 .803.31 1.664.698 2.133.077.094.088.176.064.272-.07.297-.225.92-.254 1.048-.04.185-.132.226-.306.137-1.14-.53-1.852-2.19-1.852-3.529 0-2.874 2.09-5.512 6.02-5.512 3.163 0 5.623 2.257 5.623 5.27 0 3.142-1.98 5.667-4.734 5.667-0.924 0-1.795-.48-2.092-1.035 0 0-.5 1.92-.62 2.41-.223.878-.83 1.76-1.323 2.417C9.96 21.86 10.96 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
                  </svg>
                </a>
                <a
                  href="#"
                  aria-label="YouTube"
                  className="text-black/70 hover:text-black/90 transform hover:scale-105"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5 text-black/70"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path d="M23.498 6.186a3.001 3.001 0 0 0-2.115-2.12C19.913 3.5 12 3.5 12 3.5s-7.913 0-9.383.566A3.001 3.001 0 0 0 .502 6.186 31.38 31.38 0 0 0 0 12a31.38 31.38 0 0 0 .502 5.814 3.001 3.001 0 0 0 2.115 2.12C4.087 20.5 12 20.5 12 20.5s7.913 0 9.383-.566a3.001 3.001 0 0 0 2.115-2.12A31.38 31.38 0 0 0 24 12a31.38 31.38 0 0 0-.502-5.814zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
                  </svg>
                </a>
                <a
                  href="#"
                  aria-label="TikTok"
                  className="text-black/70 hover:text-black/90 transform hover:scale-105"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5 text-black/70"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path d="M16.5 3h2.5v2a5 5 0 0 1-5 5h-1v-2a3 3 0 0 0 3-3V3z" />
                    <path d="M12 8v8a4 4 0 1 1-4-4V8a8 8 0 1 0 4 0z" />
                  </svg>
                </a>
              </div>

              <h4 className="font-antarctican text-sm md:text-xl  font-semibold uppercase tracking-widest text-center md:text-left mb-2 md:mb-3">
                Popular searches
              </h4>
              {/* Horizontal list that stays on one line at lg (no wrap) */}
              <ul className="flex flex-wrap items-center gap-3 mt-3 md:mt-4 justify-center md:justify-start lg:flex-nowrap">
                {popularSearches.map((p) => (
                  <li key={p} className="inline-block">
                    <Link to="#" className="font-antarctican text-sm underline opacity-90 px-2 py-0.5 whitespace-nowrap">
                      {p}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>
      </footer>

      {/* Copyright */}
      <div className="bg-white p-4">
        <p className="text-sm font-antarctican font-semibold text-center text-black md:text-md opacity-90">
          COPYRIGHT © 2025 VARELS – T-SHIRTS
        </p>
      </div>

    </div>
  );
}
