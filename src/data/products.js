/**
 * Converted from TypeScript → JavaScript.
 *
 * IMPORTANT:
 * In JavaScript, object fields MUST have actual values.
 * You cannot write: name, price, category (unless those variables exist).
 */

export const products = [
  {
    id: "1",
    name: "Elegant Evening Dress",
    price: 120,
    category: "shoes",
    image: "/placeholder.svg",
    description: "Perfect for evening occasions.",
    rating: 4.6,
    inStock: true,
  },
  {
    id: "2",
    name: "Classic Daily Outfit",
    price: 75,
    category: "shoes",
    image: "/placeholder.svg",
    description: "Comfortable and stylish for everyday use.",
    rating: 4.3,
    inStock: true,
  },
  {
    id: "3",
    name: "Chain Strap Bag",
    price: 90,
    category: "bags",
    image: "/placeholder.svg",
    description: "Featuring adjustable chain strap.",
    rating: 4.5,
    inStock: true,
  },
  {
    id: "4",
    name: "Italian Leather Shoes",
    price: 150,
    category: "shoes",
    image: "/placeholder.svg",
    description: "Crafted from Italian leather.",
    rating: 4.8,
    inStock: true,
  },
  {
    id: "5",
    name: "Minimalist Watch",
    price: 110,
    category: "watches",
    image: "/placeholder.svg",
    description: "Clean design with premium finishing.",
    rating: 4.4,
    inStock: true,
  },
  {
    id: "6",
    name: "Sport Sneakers",
    price: 95,
    category: "shoes",
    image: "/placeholder.svg",
    description: "Lightweight build and solid grip.",
    rating: 4.2,
    inStock: true,
  },
  {
    id: "7",
    name: "Handcrafted Bag",
    price: 130,
    category: "bags",
    image: "/placeholder.svg",
    description: "Hand-stitched detailing.",
    rating: 4.7,
    inStock: true,
  },
  {
    id: "8",
    name: "All-Weather Boots",
    price: 160,
    category: "shoes",
    image: "/placeholder.svg",
    description: "Waterproof and durable construction.",
    rating: 4.6,
    inStock: true,
  },
  {
    id: "9",
    name: "Leather Wallet",
    price: 40,
    category: "bags",
    image: "/placeholder.svg",
    description: "Compact storage with premium feel.",
    rating: 4.1,
    inStock: true,
  },
  {
    id: "10",
    name: "Diver Watch Pro",
    price: 220,
    category: "watches",
    image: "/placeholder.svg",
    description: "300m water resistance with luminous dial.",
    rating: 4.9,
    inStock: true,
  },
  {
    id: "11",
    name: "Smart Watch Lite",
    price: 180,
    category: "watches",
    image: "/placeholder.svg",
    description: "Daily tracking with a clean interface.",
    rating: 4.4,
    inStock: true,
  },
  {
    id: "12",
    name: "Smart Watch Titanium",
    price: 320,
    category: "watches",
    image: "/placeholder.svg",
    description: "Heart rate monitor and titanium case.",
    rating: 4.8,
    inStock: true,
  },
];

/**
 * NOTE about icon:
 * If your UI expects icon as a React component (e.g., from lucide-react),
 * then you must import and set icon: <Component>.
 *
 * If your UI only displays text or maps icon keys elsewhere, keeping icon as a string is fine.
 */
export const categories = [
  { id: "all", name: "All", icon: "all" },
  { id: "bags", name: "Bags", icon: "bags" },
  { id: "shoes", name: "Shoes", icon: "shoes" },
  { id: "watches", name: "Watches", icon: "watches" },
];
