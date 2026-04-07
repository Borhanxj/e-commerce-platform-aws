function BackIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  )
}

function CartIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 01-8 0" />
    </svg>
  )
}

function HeartIcon({ filled }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  )
}

const PRODUCTS = {
  1: [
    { id: 1, name: 'Floral Wrap Dress', price: 89.99 },
    { id: 2, name: 'Linen Blazer', price: 129.99 },
    { id: 3, name: 'Ribbed Knit Top', price: 44.99 },
    { id: 4, name: 'Wide-Leg Trousers', price: 74.99 },
    { id: 5, name: 'Silk Cami Blouse', price: 59.99 },
    { id: 6, name: 'Tailored Mini Skirt', price: 54.99 },
  ],
  2: [
    { id: 7, name: 'Oxford Button-Down', price: 64.99 },
    { id: 8, name: 'Slim Chinos', price: 69.99 },
    { id: 9, name: 'Merino Crew Sweater', price: 89.99 },
    { id: 10, name: 'Relaxed Linen Shirt', price: 59.99 },
    { id: 11, name: 'Tapered Joggers', price: 54.99 },
    { id: 12, name: 'Classic Polo', price: 49.99 },
  ],
  3: [
    { id: 13, name: 'Double-Breasted Coat', price: 219.99 },
    { id: 14, name: 'Quilted Puffer Jacket', price: 159.99 },
    { id: 15, name: 'Trench Coat', price: 189.99 },
    { id: 16, name: 'Leather Biker Jacket', price: 249.99 },
    { id: 17, name: 'Wool Duffle Coat', price: 199.99 },
    { id: 18, name: 'Windbreaker', price: 119.99 },
  ],
  4: [
    { id: 19, name: 'Leather Chelsea Boots', price: 149.99 },
    { id: 20, name: 'White Leather Sneakers', price: 99.99 },
    { id: 21, name: 'Block Heel Mules', price: 89.99 },
    { id: 22, name: 'Running Trainers', price: 119.99 },
    { id: 23, name: 'Strappy Sandals', price: 69.99 },
    { id: 24, name: 'Suede Loafers', price: 109.99 },
  ],
  5: [
    { id: 25, name: 'Leather Tote Bag', price: 129.99 },
    { id: 26, name: 'Silk Scarf', price: 49.99 },
    { id: 27, name: 'Structured Bucket Hat', price: 34.99 },
    { id: 28, name: 'Leather Belt', price: 44.99 },
    { id: 29, name: 'Gold Hoop Earrings', price: 29.99 },
    { id: 30, name: 'Sunglasses', price: 59.99 },
  ],
  6: [
    { id: 31, name: 'High-Waist Leggings', price: 64.99 },
    { id: 32, name: 'Sports Bra', price: 39.99 },
    { id: 33, name: 'Zip-Up Hoodie', price: 74.99 },
    { id: 34, name: 'Cycling Shorts', price: 44.99 },
    { id: 35, name: 'Mesh Running Vest', price: 34.99 },
    { id: 36, name: 'Sweat-Wicking Tee', price: 29.99 },
  ],
  7: [
    { id: 37, name: 'Tailored Blazer', price: 199.99 },
    { id: 38, name: 'Pleated Dress Trousers', price: 109.99 },
    { id: 39, name: 'Satin Evening Gown', price: 289.99 },
    { id: 40, name: 'Classic Tuxedo Shirt', price: 89.99 },
    { id: 41, name: 'Pencil Skirt', price: 79.99 },
    { id: 42, name: 'Tie & Pocket Square', price: 39.99 },
  ],
  8: [
    { id: 43, name: 'Denim Dungarees', price: 34.99 },
    { id: 44, name: 'Striped Onesie Set', price: 24.99 },
    { id: 45, name: 'Puffer Vest', price: 44.99 },
    { id: 46, name: 'Jersey Dress', price: 29.99 },
    { id: 47, name: 'Canvas Trainers', price: 34.99 },
    { id: 48, name: 'Knitted Cardigan', price: 39.99 },
  ],
}

export default function CategoryPage({
  category,
  onBack,
  onAddToCart,
  onRemoveFromCart,
  onAddToWishlist,
  onRemoveFromWishlist,
  cartItems = [],
  wishlistItems = [],
}) {
  const products = PRODUCTS[category.id] ?? []

  const cartIds = new Set(cartItems.map((i) => i.id))
  const wishlistIds = new Set(wishlistItems.map((i) => i.id))

  return (
    <div className="flex min-h-svh w-full flex-col bg-[#100d1e] pt-16">
      <header className="fixed top-0 right-0 left-0 z-[1000] border-b border-white/15 bg-[rgba(16,13,30,0.75)] px-6 backdrop-blur-[20px]">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center gap-4">
          <button
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border-none bg-transparent px-2.5 py-1.5 text-sm text-[rgba(190,178,215,0.82)] transition-colors hover:bg-purple-400/12 hover:text-purple-400"
            onClick={onBack}
          >
            <BackIcon /> Back
          </button>
          <span className="ml-auto text-[22px] font-bold tracking-[4px] text-[#eeeaff]">MODÉ</span>
        </div>
      </header>

      <main className="mx-auto box-border w-full max-w-[1280px] px-6 pt-12 pb-16">
        <div className="mb-10">
          <p className="m-0 mb-2.5 text-[11px] font-bold tracking-[5px] text-purple-400 uppercase">
            Collection
          </p>
          <h1 className="m-0 mb-2 text-[36px] font-extrabold tracking-[-1px] text-[#eeeaff] max-[720px]:text-[28px]">
            {category.title}
          </h1>
          <p className="m-0 text-[15px] text-[rgba(190,178,215,0.82)]">{category.subtitle}</p>
        </div>

        <div className="grid [grid-template-columns:repeat(4,1fr)] gap-5 max-[1024px]:[grid-template-columns:repeat(3,1fr)] max-[720px]:[grid-template-columns:repeat(2,1fr)] max-[720px]:gap-3.5 max-[420px]:[grid-template-columns:1fr]">
          {products.map((product) => {
            const inCart = cartIds.has(product.id)
            const inWishlist = wishlistIds.has(product.id)
            return (
              <div
                key={product.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-white/15 bg-white/8 shadow-[0_4px_12px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-xl transition-[box-shadow,transform,border-color] duration-250 hover:-translate-y-1 hover:border-purple-400/40 hover:shadow-[0_8px_24px_rgba(0,0,0,0.3),0_0_0_1px_rgba(192,132,252,0.35),inset_0_1px_0_rgba(255,255,255,0.18)]"
              >
                <div className="flex aspect-[3/4] w-full items-center justify-center border-b border-white/15 bg-purple-400/12">
                  <span className="text-[64px] font-bold text-purple-400 opacity-35 select-none">
                    {product.name[0]}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-1 px-4 pt-3.5 pb-2.5">
                  <span className="text-sm font-semibold text-[#eeeaff]">{product.name}</span>
                  <span className="text-[15px] font-bold text-purple-400">
                    ${product.price.toFixed(2)}
                  </span>
                </div>
                <div className="flex gap-2 px-3 pb-3.5">
                  <button
                    className={
                      inCart
                        ? 'flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-purple-400 bg-transparent px-3 py-2.5 text-[13px] font-semibold text-purple-400 transition-opacity hover:opacity-88'
                        : 'flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border-none bg-purple-400 px-3 py-2.5 text-[13px] font-semibold text-[#100d1e] transition-opacity hover:opacity-88'
                    }
                    onClick={() =>
                      inCart
                        ? onRemoveFromCart && onRemoveFromCart(product.id)
                        : onAddToCart && onAddToCart(product)
                    }
                  >
                    <CartIcon /> {inCart ? 'Remove from Cart' : 'Add to Cart'}
                  </button>
                  <button
                    className={
                      inWishlist
                        ? 'flex h-[38px] w-[38px] shrink-0 cursor-pointer items-center justify-center rounded-lg border border-purple-400 bg-purple-400/12 text-purple-400 transition-colors'
                        : 'flex h-[38px] w-[38px] shrink-0 cursor-pointer items-center justify-center rounded-lg border border-white/15 bg-transparent text-[rgba(190,178,215,0.82)] transition-colors hover:border-purple-400 hover:text-purple-400'
                    }
                    aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                    onClick={() =>
                      inWishlist
                        ? onRemoveFromWishlist && onRemoveFromWishlist(product.id)
                        : onAddToWishlist && onAddToWishlist(product)
                    }
                  >
                    <HeartIcon filled={inWishlist} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
