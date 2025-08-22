import { Link } from "react-router-dom";
import { ShoppingCart, User, Menu, Search, Heart } from "lucide-react";
import { Button } from "@mantine/core";
import { useCart } from "../../../hooks/useCart";
import "../../../styles/MovingBar.css"; 

export function Header() {
  const { data: cart } = useCart();
  const itemCount =
    cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <header className="sticky top-0 z-50 w-full  bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      
      {/* Moving bar uses styles from MovingBar.css (global import above) */}
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

      <div className="container mx-auto flex h-16 items-center px-4">

        {/* Mobile: Hamburger + Search (left), Title (center), Heart + Cart (right) */}
        <div className="flex w-full items-center justify-between md:hidden">
          <div className="flex items-center gap-2">
            <Button
              variant="subtle"
              component={Link}
              to="/menu"
              className="p-2"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5 text-gray-950" strokeWidth={1} />
            </Button>
            <Button
              variant="subtle"
              component={Link}
              to="/search"
              className="p-2"
              aria-label="Open search"
            >
              <Search className="h-5 w-5 text-gray-950" strokeWidth={1} />
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

        {/* Desktop: Left = icons + title, Center = search (shorter on lg), Right = Sign In + Heart + Cart */}
        <div className="hidden w-full items-center justify-between md:flex">
          <div className="flex items-center gap-3">
            {/* Left icon group always visible on md+ */}
            <div className="flex items-center gap-2 pl-1">
              <Button
                variant="subtle"
                component={Link}
                to="/menu"
                className="p-2"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5 text-gray-950" strokeWidth={1} />
              </Button>
              <Button
                variant="subtle"
                component={Link}
                to="/search"
                className="p-2"
                aria-label="Open search"
              >
                <Search className="h-5 w-5 text-gray-950" strokeWidth={1} />
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

          {/* Center search - responsive max widths (shorter on lg) */}
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

    </header>
  );
}
