import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, Menu, Heart } from "lucide-react";
import { Button } from "@mantine/core";
import { useCart } from "../../../hooks/useCart";
import useAuthStore from '../../../stores/auth.store';
import { trackEvent } from '../../../lib/analytics';
import "../../../styles/MovingBar.css";
import { useDrawerMenu, type Section } from "../hooks/useDrawerMenu";

// Constants
const MOVING_BAR_MESSAGES = [
  "FREE SHIPPING ON ALL ORDERS OVER $50",
  "FREE SHIPPING ON ALL ORDERS OVER $50",
  "FREE SHIPPING ON ALL ORDERS OVER $50",
  "FREE SHIPPING ON ALL ORDERS OVER $50",
] as const;

const NAVIGATION_SECTIONS = [
  { title: "CATEGORIES", items: ["CLOTHING", "SHOES", "ACCESSORIES"] },
  { title: "COMPANY", items: ["ABOUT", "CAREERS", "PRESS"] },
  { title: "HELP", items: ["SHIPPING", "RETURNS", "CONTACT"] },
];

export function Header() {
  const { data: cart } = useCart();
  const itemCount =
    cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const sections: Section[] = NAVIGATION_SECTIONS;

  const navigate = useNavigate();

  // Auth state from store
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);

  // Account footer section (rendered separately so it stays at the bottom)
  const accountSection: Section = {
    title: 'ACCOUNT',
    items: isAuthenticated
      ? [{ label: 'Dashboard', to: '/dashboard' }]
      : [{ label: 'REGISTRARSE', to: '/auth/register' }, { label: 'INICIAR SESION', to: '/auth/login' }],
  };

  // Use the custom drawer menu hook
  const {
    drawerOpen,
    hamburgerRef,
    openDrawer,
    portal,
  } = useDrawerMenu({
    sections,
    accountSection,
    isAuthenticated,
    onLogout: logout,
    onNavigate: navigate,
    onTrackEvent: trackEvent,
  });

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
            {MOVING_BAR_MESSAGES.map((msg, idx) => (
              <span key={idx}>{msg}</span>
            ))}
          </div>
        </div>
      </div>

      {/* 
        Mobile: Hamburger + Search (left), 
        Title (center), Heart + Cart (right)
      */}
      <div className="container mx-auto flex h-16 items-center px-4 md:px-6">

        {/* MOBILE */}
        <div className="flex w-full items-center justify-between md:hidden relative">
          <div className="flex items-center w-28">
            <Button
              variant="subtle"
              className="p-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
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
            className="absolute left-1/2 transform -translate-x-1/2 text-4xl font-teko tracking-widest text-black"
          >
            VARELS
          </Link>

          <div className="flex items-center justify-end gap-2 w-28 pr-1">
            <Button
              variant="subtle"
              component={Link}
              to="/wishlist"
              className="p-2.5"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5 text-gray-950" strokeWidth={1} />
            </Button>
            <Button
              variant="subtle"
              component={Link}
              to="/cart"
              className="relative p-2.5"
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
          <div className="flex items-center">
            
            {/* Left icon group always visible on md+ (flush to left corner) */}
            <div className="flex items-center">
              <Button
                variant="subtle"
                className="p-2.5 focus:outline-none "
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
              className="text-4xl font-teko font-bold tracking-widest text-black ml-3"
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

          <div className="flex items-center gap-3">
            <Button
              variant="filled"
              component={Link}
              to={isAuthenticated ? '/dashboard' : '/auth/login'}
              className="p-2"
              aria-label="Account"
              onClick={() => trackEvent(isAuthenticated ? 'auth:click_profile' : 'auth:click_login', { location: 'header' })}
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
