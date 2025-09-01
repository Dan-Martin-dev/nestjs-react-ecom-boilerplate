import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { X, Plus, Search } from "lucide-react";
import { createPortal } from "react-dom";

// Constants
const DRAWER_Z_INDEX = { backdrop: 99998, panel: 99999 };
const FOCUSABLE_SELECTORS = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

// Types
export type SectionItem = string | { label: string; to: string };
export type Section = { title: string; items: SectionItem[] };

export interface UseDrawerMenuOptions {
  sections: Section[];
  accountSection: Section;
  isAuthenticated: boolean;
  onLogout: () => Promise<void>;
  onNavigate: (path: string) => void;
  onTrackEvent: (event: string, data?: Record<string, unknown>) => void;
}

export interface UseDrawerMenuReturn {
  // State
  drawerOpen: boolean;
  openIndex: number | null;
  hasOpened: boolean;

  // Refs
  panelRef: React.RefObject<HTMLDivElement | null>;
  hamburgerRef: React.RefObject<HTMLButtonElement | null>;

  // Functions
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleSection: (idx: number) => void;

  // Portal
  portal: React.ReactPortal | null;
}

export function useDrawerMenu({
  sections,
  accountSection,
  isAuthenticated,
  onLogout,
  onNavigate,
  onTrackEvent,
}: UseDrawerMenuOptions): UseDrawerMenuReturn {
  // State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [hasOpened, setHasOpened] = useState(false);

  // Refs
  const panelRef = useRef<HTMLDivElement | null>(null);
  const hamburgerRef = useRef<HTMLButtonElement | null>(null);
  const previouslyFocused = useRef<Element | null>(null);

  // Functions
  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!drawerOpen) return;
    if (e.key === "Escape") {
      e.preventDefault();
      closeDrawer();
    }
    if (e.key === "Tab") {
      // simple focus trap inside panel
      const container = panelRef.current;
      if (!container) return;
      const focusable = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS);
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
  }, [drawerOpen, closeDrawer]);

  const toggleSection = useCallback((idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  }, [openIndex]);

  const openDrawer = useCallback(() => {
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
  }, [hasOpened]);

  // Effects
  useEffect(() => {
    // capture hamburger ref at effect start so cleanup uses a stable value
    const hamAtStart = hamburgerRef.current;

    if (drawerOpen) {
      // note that drawer has been opened at least once
      setHasOpened(true);
      previouslyFocused.current = document.activeElement;
      setTimeout(() => {
        // focus first interactive element inside panel, but skip the close button
        const container = panelRef.current;
        const focusable = container?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS);
        if (focusable && focusable.length > 0) {
          // Skip the close button (first element) and focus the next element (search input)
          const targetElement = focusable.length > 1 ? focusable[1] : focusable[0];
          targetElement.focus();
        }
      }, 0);
      document.body.style.overflow = "hidden"; // prevent background scroll
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
      // return focus
      if (previouslyFocused.current instanceof HTMLElement) {
        previouslyFocused.current.focus();
      } else if (hamAtStart instanceof HTMLElement) {
        hamAtStart.focus();
      }
    };
  }, [drawerOpen, handleKeyDown]);

  // Portal creation
  const portal = (typeof document !== 'undefined' && (drawerOpen || hasOpened)) ? createPortal(
    <>
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 motion-reduce:transition-none ${drawerOpen ? 'opacity-80 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        style={{ zIndex: DRAWER_Z_INDEX.backdrop }}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        className={`fixed top-0 left-0 h-full shadow-lg w-full md:w-[360px] lg:w-[360px] transform transition-transform duration-300 motion-reduce:transition-none ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ willChange: 'transform', zIndex: DRAWER_Z_INDEX.panel, overflow: 'visible' }}
      >
        <div className="h-full flex flex-col bg-white">

          {/* Accordion Header */}
          <div className="flex items-center justify-between px-4 pt-4">
            <h2 id="drawer-title" className="text-xl font-teko"></h2>
            <button
              aria-label="Close menu"
              onClick={closeDrawer}
              className="drawer-close-button p-2 rounded bg-transparent hover:bg-gray-100"
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

          {/* Accordion Categories */}
          <div className="px-4 pt-6 overflow-y-auto flex-1 bg-white" style={{ WebkitOverflowScrolling: 'touch' }}>
            <nav className="pr-2">
              {sections.map((s, idx) => (
                <div key={s.title} className="font-inco font-normal text-sm md:text-xl md:text-base lg:text-xl uppercase font- border-b border-gray-100 py-3">
                  <div className="flex items-center justify-between">
                    <button
                      className="text-left w-full flex items-center justify-between font-teko text-base"
                      onClick={() => toggleSection(idx)}
                      aria-expanded={openIndex === idx}
                    >
                      <span className="font-inco font-normal text-sm md:text-md uppercase border-b border-gray-100">{s.title}</span>
                      <span className="ml-2">
                        <Plus className={`h-4 w-4 transition-transform ${openIndex === idx ? 'rotate-45' : ''}`} />
                      </span>
                    </button>
                  </div>

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
                              <Link to={to} className="block py-1" onClick={closeDrawer}>{label}</Link>
                            </li>
                          );
                        })}
                      </ul>
                    ) : null}
                  </div>
                </div>
              ))}
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
                  onClick={closeDrawer}
                >
                  {typeof it === 'string' ? it : it.label}
                </Link>
              ))}

              {/* Sign out action for authenticated users */}
              {isAuthenticated && (
                <button
                  onClick={async () => {
                    const ok = typeof window !== 'undefined' ? window.confirm('Sign out?') : true;
                    if (!ok) return;
                    onTrackEvent('auth:sign_out', { method: 'drawer' });
                    await onLogout();
                    onNavigate('/');
                    closeDrawer();
                  }}
                  className="font-inco font-normal text-sm md:text-md uppercase border-b border-gray-100 pb-2"
                >
                  CERRAR SESION
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>,
    document.body
  ) : null;

  return {
    drawerOpen,
    openIndex,
    hasOpened,
    panelRef,
    hamburgerRef,
    openDrawer,
    closeDrawer,
    toggleSection,
    portal,
  };
}
