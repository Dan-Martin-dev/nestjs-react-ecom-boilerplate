import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, User, Menu, Search, Heart, X, Plus } from "lucide-react";
import { Button } from "@mantine/core";
import { useCart } from "../../../hooks/useCart";
import "../../../styles/MovingBar.css"; 
import { createPortal } from "react-dom";

export function Header() {
  const { data: cart } = useCart();
  const itemCount =
    cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  // Drawer state and refs
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const hamburgerRef = useRef<HTMLButtonElement | null>(null);
  const previouslyFocused = useRef<Element | null>(null);

  // track whether drawer has ever been opened to avoid creating portal on initial load
  const [hasOpened, setHasOpened] = useState(false);

  type SectionItem = string | { label: string; to: string };
  type Section = { title: string; items: SectionItem[] };

  const sections: Section[] = [
    { title: "CATEGORIES", items: ["CLOTHING", "SHOES", "ACCESSORIES"] },
    { title: "COMPANY", items: ["ABOUT", "CAREERS", "PRESS"] },
    { title: "HELP", items: ["SHIPPING", "RETURNS", "CONTACT"] },
  ];

  // Account footer section (rendered separately so it stays at the bottom)
  const accountSection: Section = {
    title: 'ACCOUNT',
    items: [{ label: 'Sign Up', to: '/signup' }, { label: 'Log In', to: '/login' }],
  };

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!drawerOpen) return;
      if (e.key === "Escape") {
        e.preventDefault();
        setDrawerOpen(false);
      }
      if (e.key === "Tab") {     
        // simple focus trap inside panel
        const container = panelRef.current;
        if (!container) return;
        const focusable = container.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement as HTMLElement | null;
        if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
        if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        }
      }
    }

    // capture hamburger ref at effect start so cleanup uses a stable value
    const hamAtStart = hamburgerRef.current;

    if (drawerOpen) {
      // note that drawer has been opened at least once
      setHasOpened(true);
      previouslyFocused.current = document.activeElement;
      setTimeout(() => {
        // focus first interactive element inside panel
        const container = panelRef.current;
        const focusable = container?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable && focusable.length > 0) focusable[0].focus();
      }, 0);
      document.body.style.overflow = "hidden"; // prevent background scroll
      window.addEventListener("keydown", onKeyDown);
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
      // return focus
      if (previouslyFocused.current instanceof HTMLElement) {
        previouslyFocused.current.focus();
      } else if (hamAtStart instanceof HTMLElement) {
        hamAtStart.focus();
      }
    };
  }, [drawerOpen]);

  function toggleSection(idx: number) {
    setOpenIndex(openIndex === idx ? null : idx);
  }

  // Open drawer in two steps on first use: mount portal first, then open to allow CSS transition
  function openDrawer() {
    if (!hasOpened) {
      setHasOpened(true);
      // wait a frame so portal renders with closed state, then open to trigger transition
      if (typeof requestAnimationFrame !== 'undefined') {
        requestAnimationFrame(() => setDrawerOpen(true));
      } else {
        setTimeout(() => setDrawerOpen(true), 16);
      }
    } else {
      setDrawerOpen(true);
    }
  }

  /* Hamburger menu */
  // Only create portal on client after document is available and the drawer has been interacted with
  const portal = (typeof document !== 'undefined' && (drawerOpen || hasOpened)) ? createPortal(
    <>
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 motion-reduce:transition-none ${drawerOpen ? 'opacity-80 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        style={{ zIndex: 99998 }}
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />

      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        className={`fixed top-0 left-0 h-full shadow-lg w-full md:w-[360px] lg:w-[360px] transform transition-transform duration-300 motion-reduce:transition-none ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ willChange: 'transform', zIndex: 99999, overflow: 'visible' }}
      >
        <div className="h-full flex flex-col bg-white">

          {/* Accordion Header */}
          <div className="flex items-center justify-between px-4 pt-4">
            <h2 id="drawer-title" className="text-xl font-teko"></h2>
            <button
              aria-label="Close menu"
              onClick={() => setDrawerOpen(false)}
                className="p-2 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <X className="h-5 w-5 text-gray-900" />
            </button>
          </div>

          {/* Accordion Search bar */}
          <div className="px-4 pt-4">
            <div className="relative">
              <input
                type="text"
                placeholder="SEARCH FOR PRODUCTS..."
                className="w-full rounded-md border-0 bg-[#F2F2F2] text-sm font-inco text-black px-4 py-3 pr-12 focus:outline-none"
                aria-label="Drawer search"
              />
              <button
                className="absolute right-0 top-1/2 -translate-y-1/2 bg-black text-white p-3 rounded-r-md"
                aria-label="Search"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Accordion Categories  */}
          <div className="px-4 pt-6 overflow-y-auto flex-1 bg-white" style={{ WebkitOverflowScrolling: 'touch' }}>
            <nav className="pr-2">
              {sections.map((s, idx) => (

                /* Title */
                <div key={s.title} className="font-inco font-normal text-sm md:text-xl md:text-base lg:text-xl  uppercase font- border-b border-gray-100 py-3">
                  <div className="flex items-center justify-between">
                    <button
                      className="text-left w-full flex items-center justify-between font-teko text-base"
                      onClick={() => toggleSection(idx)}
                      aria-expanded={openIndex === idx}
                    >
                      <span className="font-inco font-normal text-sm md:text-md  uppercase border-b border-gray-100">{s.title}</span>
                      <span className="ml-2">
                        <Plus className={`h-4 w-4 transition-transform ${openIndex === idx ? 'rotate-45' : ''}`} />
                      </span>
                    </button>
                  </div>

                  {/* Expanded panel: titles remain visible. Use max-height expand to open slowly; no opacity fade on titles. */}
                  <div
                    className={`mt-3 pl-2 font-inco text-sm text-gray-700 overflow-hidden transition-all duration-700 ease-in-out ${
                      (drawerOpen && openIndex === idx) ? 'max-h-[600px]' : 'max-h-0'
                    }`}
                    aria-hidden={!(drawerOpen && openIndex === idx)}
                    role="region"
                  >
                    {drawerOpen && openIndex === idx ? (
                      <ul className="space-y-2">
                        {s.items.map((it: SectionItem) => {
                          const label = typeof it === 'string' ? it : it.label;
                          const to = typeof it === 'string' ? '#' : it.to;
                          return (
                            <li key={label}>
                              <Link to={to} className="block py-1">{label}</Link>
                            </li>
                          );
                        })}
                      </ul>
                    ) : null}
                  </div>
                </div>
              ))}

              {/* end nav */}
            </nav>
          </div>
          
          {/* Fixed footer inside drawer with account links */}
          <div className="px-4 py-4 border-t bg-white">
            <div className="flex items-center justify-center gap-6">
              {accountSection.items.map((it: SectionItem) => (
                <Link
                  key={typeof it === 'string' ? it : it.label}
                  to={typeof it === 'string' ? '#' : it.to}
                  className="font-inco font-normal text-sm md:text-md uppercase border-b border-gray-100 pb-2"
                >
                  {typeof it === 'string' ? it : it.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

      </aside>
    </>,
    document.body
  ) : null;

  // Prevent FOUC: hide header via inline style until client mount completes
  return (
    <>
      <header
        className="sticky top-0 z-50 w-full  bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60"
      >
      
      {/* MOVING BAR */}
      <div className="bg_varels_pink moving-bar moving-bar-pause-hover" aria-hidden="true">
        <div className="moving-bar-inner">
          <div className="font-thin text- moving-bar-content text-black font-teko">
            {[
              "FREE SHIPPING ON ALL ORDERS OVER $50",
              "FREE SHIPPING ON ALL ORDERS OVER $50",
              "FREE SHIPPING ON ALL ORDERS OVER $50",
              "FREE SHIPPING ON ALL ORDERS OVER $50",
            ].map((msg, idx) => (
              <span key={idx}>{msg}</span>
            ))}
          </div>
        </div>
      </div>

      {/* 
        Mobile: Hamburger + Search (left), 
        Title (center), Heart + Cart (right)
      */}
      <div className="container mx-auto flex h-16 items-center px-4">

        {/* DESKTOP */}
        <div className="flex w-full items-center justify-between md:hidden">
          <div className="flex items-center gap-2">
            <Button
              variant="subtle"
              className="p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
              aria-label="Open menu"
              onClick={openDrawer}
              aria-expanded={drawerOpen}
              ref={hamburgerRef}
            >
              <Menu className="h-5 w-5 text-gray-950" strokeWidth={1} />
            </Button>
          </div>
          <Link
            to="/"
            className="text-4xl font-teko tracking-widest text-black"
          >
            VARELS
          </Link>
          <div className="flex items-center gap-2">
            <Button
              variant="subtle"
              component={Link}
              to="/wishlist"
              className="p-2"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5 text-gray-950" strokeWidth={1} />
            </Button>
            <Button
              variant="subtle"
              component={Link}
              to="/cart"
              className="relative p-2"
              aria-label="Cart"
            >
              <ShoppingCart className="h-5 w-5 text-gray-950" strokeWidth={1} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-blue-600 text-xs text-white flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* 
          Desktop: Left = icons + title, Center = search,
          Right = Sign In + Heart + Cart
        */}
        <div className="hidden w-full items-center justify-between md:flex">
          <div className="flex items-center gap-3">
            
            {/* Left icon group always visible on md+ */}
            <div className="flex items-center gap-2 pl-1">
              <Button
                variant="subtle"
                className="p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
                aria-label="Open menu"
                onClick={openDrawer}
                aria-expanded={drawerOpen}
                ref={hamburgerRef}
              >
                <Menu className="h-5 w-5 text-gray-950" strokeWidth={1} />
              </Button>
            </div>

            {/* Small gap between icons and title so they don't touch */}
            <Link
              to="/"
              className="text-4xl font-teko font-bold tracking-widest text-black ml-2"
            >
              VARELS
            </Link>
          </div>

          {/* Center search - existing search left untouched visually */}
          <div className="flex-1 flex justify-center px-4">
            <form className="w-full max-w-[920px] lg:max-w-[720px]">
              <input
                type="text"
                placeholder="SEARCH FOR PRODUCTS..."
                className="w-full rounded-md border text-sm font-inco text-black border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Search products"
              />
            </form>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="filled"
              component={Link}
              to="/dashboard"
              className="p-2"
              aria-label="Account"
            >
              <User className="h-5 w-5 text-gray-950" strokeWidth={1} />
            </Button>
            <Button
              variant="subtle"
              component={Link}
              to="/wishlist"
              className="p-2"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5 text-gray-950" strokeWidth={1} />
            </Button>
            <Button
              variant="subtle"
              component={Link}
              to="/cart"
              className="relative p-2"
              aria-label="Cart"
            >
              <ShoppingCart className="h-5 w-5 text-gray-950" strokeWidth={1} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-blue-600 text-xs text-white flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Button>
          </div>
        </div>

      </div>

      {/* Drawer and backdrop */}
    </header>

      {portal}
     </>
  );
}
