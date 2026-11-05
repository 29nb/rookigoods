import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronUp,
  Heart,
  Menu,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  X,
} from "lucide-react";

type Product = {
  id: string;
  name: string;
  color: string;
  note: string;
  price: number;
  image: string;
  accent: "coral" | "blue" | "green" | "yellow";
  modelImage: string;
  natureImage: string;
  badge?: string;
};

type CartItem = Product & { qty: number };

const image = (name: string) => `${import.meta.env.BASE_URL}assets/rookigoods/${name}`;
const money = (value: number) => `$${value.toFixed(2)}`;

const products: Product[] = [
  { id: "classic", name: "The Classic", color: "Cherry", note: "Cherry / 100% cotton", price: 24, image: image("classic-grid.jpg"), accent: "coral", modelImage: image("male-bandana-portrait.jpg"), natureImage: image("nature-leaf-veins.jpg"), badge: "bestseller" },
  { id: "daydream", name: "The Daydream", color: "Cobalt", note: "Cobalt / 100% cotton", price: 24, image: image("daydream-grid.jpg"), accent: "blue", modelImage: image("male-bandana-resting.jpg"), natureImage: image("nature-leaves.jpg"), badge: "new color" },
  { id: "field-trip", name: "The Field Trip", color: "Moss", note: "Moss / 100% cotton", price: 24, image: image("field-trip-grid.jpg"), accent: "green", modelImage: image("male-bandana-nature.jpg"), natureImage: image("nature-meadow.jpg") },
  { id: "happy-hour", name: "The Happy Hour", color: "Butter", note: "Butter / 100% cotton", price: 24, image: image("happy-hour.jpg"), accent: "yellow", modelImage: image("male-bandana-yellow.jpg"), natureImage: image("nature-leaves.jpg") },
];

const navItems = [
  ["shop all", "/shop"],
  ["bestsellers", "/shop"],
  ["the rooki way", "/story"],
] as const;

function useRoute() {
  const knownRoutes = ["/", "/shop", "/product/classic", "/product/daydream", "/product/field-trip", "/product/happy-hour", "/story", "/ways", "/ways-to-wear", "/bag", "/checkout", "/confirmation", "/404"];
  const readRoute = () => {
    const hash = window.location.hash.startsWith("#/") ? window.location.hash.slice(1) : "";
    if (hash) return hash;
    const pathname = window.location.pathname || "/";
    return knownRoutes.find((route) => route !== "/" && pathname.endsWith(route)) ?? (pathname === "/" ? "/" : "/");
  };
  const [path, setPath] = useState(readRoute);
  useEffect(() => {
    const onChange = () => setPath(readRoute());
    window.addEventListener("hashchange", onChange);
    window.addEventListener("popstate", onChange);
    return () => {
      window.removeEventListener("hashchange", onChange);
      window.removeEventListener("popstate", onChange);
    };
  }, []);
  const navigate = (next: string) => {
    if (next === path) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    window.location.hash = next;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return { path, navigate };
}

export default function App() {
  const { path, navigate } = useRoute();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState("");

  const itemCount = cart.reduce((total, item) => total + item.qty, 0);
  const subtotal = cart.reduce((total, item) => total + item.qty * item.price, 0);
  const go = (next: string) => {
    setCartOpen(false);
    setMenuOpen(false);
    navigate(next);
  };
  const addToCart = (product: Product, qty = 1) => {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      return existing
        ? current.map((item) => item.id === product.id ? { ...item, qty: item.qty + qty } : item)
        : [...current, { ...product, qty }];
    });
    setToast(`${product.name} added to your bag`);
    window.setTimeout(() => setToast(""), 2200);
  };
  const updateQty = (id: string, qty: number) => setCart((current) => current.flatMap((item) => item.id === id ? (qty > 0 ? [{ ...item, qty }] : []) : [item]));
  const removeItem = (id: string) => setCart((current) => current.filter((item) => item.id !== id));
  const currentProduct = products.find((product) => product.id === path.split("/")[2]) ?? products[0];
  const isCheckout = path === "/checkout" || path === "/confirmation";

  return <div className="site-shell">
    <Announcement />
    <Header itemCount={itemCount} menuOpen={menuOpen} onMenu={() => setMenuOpen((open) => !open)} onCart={() => setCartOpen(true)} onNavigate={go} />
    {menuOpen && <MobileMenu onNavigate={go} />}
    <main>
      {path === "/" && <Home onNavigate={go} onAdd={addToCart} />}
      {path === "/shop" && <Shop onNavigate={go} onAdd={addToCart} />}
      {path.startsWith("/product/") && <ProductDetail product={currentProduct} onNavigate={go} onAdd={addToCart} />}
      {path === "/story" && <Story onNavigate={go} />}
      {(path === "/ways" || path === "/ways-to-wear") && <WaysToWear onNavigate={go} />}
      {path === "/bag" && <BagPage cart={cart} subtotal={subtotal} onNavigate={go} onUpdate={updateQty} onRemove={removeItem} onAdd={addToCart} />}
      {path === "/checkout" && <Checkout cart={cart} subtotal={subtotal} onNavigate={go} onUpdate={updateQty} onRemove={removeItem} setCart={setCart} />}
      {path === "/confirmation" && <Confirmation onNavigate={go} />}
      {!['/', '/shop', '/story', '/ways', '/ways-to-wear', '/bag', '/checkout', '/confirmation'].includes(path) && !path.startsWith('/product/') && <NotFound onNavigate={go} />}
    </main>
    {!isCheckout && <Footer onNavigate={go} />}
    {cartOpen && <CartDrawer cart={cart} subtotal={subtotal} onClose={() => setCartOpen(false)} onNavigate={go} onUpdate={updateQty} onRemove={removeItem} />}
    {toast && <div className="toast"><Check size={16} /> {toast}</div>}
  </div>;
}

function Announcement() {
  return <div className="announcement">good things come in small squares. free shipping on orders $50+ <span>→</span></div>;
}

function Header({ itemCount, menuOpen, onMenu, onCart, onNavigate }: { itemCount: number; menuOpen: boolean; onMenu: () => void; onCart: () => void; onNavigate: (path: string) => void }) {
  return <header className="site-header">
    <nav className="header-left">{navItems.map(([label, path]) => <button key={label} onClick={() => onNavigate(path)}>{label}</button>)}</nav>
    <button className="brand-lockup" onClick={() => onNavigate("/")} aria-label="Rooki Goods home"><strong>rooki</strong><small>goods<sup>®</sup></small></button>
    <div className="header-right"><button className="how-to-wear" onClick={() => onNavigate("/ways-to-wear")}>how to wear</button><button className="header-icon search-icon" aria-label="Search"><Search size={17} /></button><button className="header-icon hide-mobile" aria-label="Account"><span className="account-dot" /></button><button className="bag-link" onClick={onCart} aria-label="Open bag"><ShoppingBag size={17} /><span>({itemCount})</span></button><button className="menu-button" onClick={onMenu} aria-label="Menu">{menuOpen ? <X size={20} /> : <Menu size={20} />}</button></div>
  </header>;
}

function MobileMenu({ onNavigate }: { onNavigate: (path: string) => void }) {
  return <div className="mobile-menu">{[...navItems, ["how to wear", "/ways-to-wear"] as const].map(([label, path], index) => <button key={label} onClick={() => onNavigate(path)}><span>0{index + 1}</span>{label}<ArrowUpRight size={17} /></button>)}<button onClick={() => onNavigate("/bag")}><span>05</span>your bag<ArrowUpRight size={17} /></button></div>;
}

function Home({ onNavigate, onAdd }: { onNavigate: (path: string) => void; onAdd: (product: Product) => void }) {
  return <div className="home-page">
    <section className="home-hero container"><div className="hero-copy yellow-panel"><span className="eyebrow">bandanas for anyone. and everyone.</span><h1>Small square.<br /><em>Big energy.</em></h1><p>A little color. A lot of possibility. Meet the everyday bandana that’s anything but ordinary.</p><button className="dark-button" onClick={() => onNavigate("/shop")}>find your bandana <ArrowUpRight size={15} /></button><span className="hero-note">✦ 100% cotton. 100% your thing.</span></div><div className="hero-photo"><img src={image("male-bandana-profile.jpg")} alt="Person wearing a colorful bandana" /><span className="photo-sticker">Good on<br />anyone.</span><span className="photo-caption">a good day starts with a little color.</span></div></section>
    <section className="micro-marquee"><span>✦ tie it your way</span><span>✦ a little color goes a long way</span><span>✦ no rules. just rookI.</span><span>✦ bandanas for every day</span></section>
    <section className="blue-feature container"><div><span className="eyebrow">the everyday collection</span><h2>Your new<br /><em>plus-one.</em></h2><p>Soft cotton. Bold little details. Made to tag along, from your morning coffee to your next big somewhere.</p><button className="light-button" onClick={() => onNavigate("/shop")}>meet the collection <ArrowUpRight size={15} /></button></div><div className="feature-art"><img src={products[0].image} alt="Cherry bandana" /><span>The Classic / Cherry<br />22 × 22 inches</span></div></section>
    <section className="lavender-feature container"><img src={image("male-bandana-portrait.jpg")} alt="Colorful fashion styling" /><div><span className="eyebrow">one bandana. endless possibilities.</span><h2>No right way.<br /><em>Just your way.</em></h2><p>Around your neck, in your hair, on your favorite bag. A little twist is all it takes to make it yours.</p><div className="button-row"><button className="outline-button" onClick={() => onNavigate("/ways-to-wear")}>the neck tie</button><button className="outline-button" onClick={() => onNavigate("/ways-to-wear")}>the head scarf</button><button className="outline-button" onClick={() => onNavigate("/ways-to-wear")}>the bag buddy</button></div></div></section>
    <CollectionSection onNavigate={onNavigate} onAdd={onAdd} />
    <NatureBreak />
    <section className="story-strip peach-panel container"><img src={image("male-bandana-resting.jpg")} alt="Colorful folded textile" /><div><span className="eyebrow">a little good energy</span><h2>Less ordinary.<br /><em>More you.</em></h2><p>We believe the best things in your wardrobe don’t tell you who to be. They help you feel a little more yourself.</p><button className="outline-button" onClick={() => onNavigate("/story")}>get to know rooki <ArrowUpRight size={15} /></button></div></section>
    <CommunitySection />
    <EmailSignup />
  </div>;
}

function CommunitySection() {
  return <section className="community-section container"><div className="section-top"><div><span className="eyebrow">good company</span><h2>Good <em>company.</em></h2><p>Different people. Different worlds. All Rooki. Tag us in your mix.</p></div><a className="underlined-link" href="#instagram">@rookigoods <ArrowUpRight size={15} /></a></div><div className="community-grid"><figure><img src={image("male-bandana-profile.jpg")} alt="Person wearing a bandana" /><figcaption>good on anyone.</figcaption></figure><figure><img src={image("male-bandana-portrait.jpg")} alt="Red bandana styling" /><figcaption>good on you.</figcaption></figure><figure><img src={image("male-bandana-profile.jpg")} alt="Colorful fashion" /><figcaption>good on earth.</figcaption></figure></div></section>;
}

function NatureBreak() {
  return <section className="nature-break container"><div className="nature-copy"><span className="eyebrow">good outside</span><h2>Color looks<br /><em>better outdoors.</em></h2><p>Every square is made for the long way home, a late lunch in the sun, and whatever the day decides to become.</p></div><img src={image("nature-meadow.jpg")} alt="Wildflower meadow at sunset" /><img src={image("nature-leaves.jpg")} alt="Leaves in dappled light" /></section>;
}

function ProductCampaign({ product }: { product: Product }) {
  return <section className="product-campaign container"><div><img src={product.modelImage} alt={`${product.name} styled on a model`} /><span>01 / wear it your way</span></div><div><img src={product.natureImage} alt={`${product.name} in an outdoor setting`} /><span>02 / take it outside</span></div></section>;
}

function CollectionSection({ onNavigate, onAdd }: { onNavigate: (path: string) => void; onAdd: (product: Product) => void }) {
  return <section className="collection-section container"><div className="section-top"><div><span className="eyebrow">small squares. big personalities.</span><h2>Pick your <em>personality.</em></h2></div><button className="underlined-link" onClick={() => onNavigate("/shop")}>shop all bandanas <ArrowRight size={15} /></button></div><div className="filter-pills"><button className="active">all bandanas</button><button>fan favorites</button><button>fresh arrivals</button><button>just a good idea</button></div><div className="product-grid">{products.map((product) => <ProductCard product={product} key={product.id} onAdd={onAdd} onNavigate={onNavigate} />)}</div><TrustBar /></section>;
}

function ProductCard({ product, onAdd, onNavigate }: { product: Product; onAdd: (product: Product) => void; onNavigate: (path: string) => void }) {
  return <article className="product-card"><button className={`product-image ${product.accent}`} onClick={() => onNavigate(`/product/${product.id}`)} aria-label={`Open ${product.name}`}><img src={product.image} alt={product.name} /><span className="product-badge">{product.badge ?? "new color"}</span><span className="heart"><Heart size={15} /></span></button><div className="product-info"><div><h3>{product.name}</h3><p>{product.note}</p><span className="swatch-row"><i className={`swatch ${product.accent}`} /><i className="swatch blue" /><i className="swatch yellow" /><small>+2</small></span></div><strong>{money(product.price)}</strong></div><div className="product-actions"><span>{product.id === "classic" ? "bestseller" : "22 × 22 inches of possibility"}</span><button onClick={() => onAdd(product)}>add +</button></div></article>;
}

function TrustBar() {
  return <div className="trust-bar"><div><span>♧</span><b>soft on you</b><small>100% natural cotton</small></div><div><span>◇</span><b>good things, delivered</b><small>free US shipping over $50</small></div><div><span>↻</span><b>no second guessing</b><small>easy 30-day returns</small></div></div>;
}

function Shop({ onNavigate, onAdd }: { onNavigate: (path: string) => void; onAdd: (product: Product) => void }) {
  const [filter, setFilter] = useState("all bandanas");
  return <div className="page-wrap shop-page"><section className="shop-hero container"><div className="yellow-panel"><span className="eyebrow">small squares. big personalities.</span><h1>Find your kind of <em>color.</em></h1><p>For coffee runs, big adventures, and all the in-between. Meet your everyday plus-one: soft cotton bandanas for anyone.</p></div><img src={image("male-bandana-resting.jpg")} alt="Folded colorful textile" /></section><div className="shop-layout container"><aside className="shop-filters"><span className="eyebrow">find your favorite</span><p>a little help narrowing it down.</p><strong>color</strong>{["Cherry", "Cobalt", "Moss", "Butter"].map((color) => <label key={color}><input type="checkbox" /> {color}</label>)}<strong>material</strong><label><input type="checkbox" /> 100% cotton</label><strong>price</strong><label><input type="checkbox" /> under $25</label><button className="outline-button">clear filters</button></aside><section className="shop-results"><div className="shop-toolbar"><div className="filter-pills">{["all bandanas", "fan favorites", "fresh arrivals"].map((option) => <button key={option} className={filter === option ? "active" : ""} onClick={() => setFilter(option)}>{option}</button>)}</div><label>sort by <select defaultValue="featured"><option value="featured">Featured</option><option value="price">Price: low to high</option></select></label></div><p className="results-count">All {products.length} bandanas <span>one size. endless possibilities.</span></p><div className="product-grid">{products.map((product) => <ProductCard product={product} key={product.id} onAdd={onAdd} onNavigate={onNavigate} />)}</div></section></div><section className="shop-bottom lavender-feature container"><img src={image("male-bandana-profile.jpg")} alt="Bandana styling" /><div><span className="eyebrow">one bandana. so many yous.</span><h2>A little twist.<br /><em>A whole new mood.</em></h2><p>Neck tie, head scarf, bag buddy. Take a few of our favorite ideas and make them entirely your own.</p><button className="outline-button" onClick={() => onNavigate("/ways-to-wear")}>find your way to wear <ArrowUpRight size={15} /></button></div></section><EmailSignup /></div>;
}

function ProductDetail({ product, onNavigate, onAdd }: { product: Product; onNavigate: (path: string) => void; onAdd: (product: Product, qty?: number) => void }) {
  const [qty, setQty] = useState(1);
  const [open, setOpen] = useState("little details");
  const accordions = [
    ["little details", "100% natural cotton. 22 × 22 inches (56 × 56 cm). A soft, breathable square with a classic paisley print and finished edges. Made to wear, rewear, and make your own."],
    ["keep it feeling good", "Machine wash cold with similar colors. Use a gentle detergent, then line dry. Warm iron if you like. Skip bleach and high heat to keep the color happy."],
    ["delivery & returns", "Standard US delivery: 3–5 business days. Free on orders $50+. Unworn bandanas can be returned within 30 days."],
  ];
  return <div className="page-wrap product-page"><div className="breadcrumbs container"><button onClick={() => onNavigate("/shop")}><ArrowLeft size={15} /> shop all</button><span>/</span><span>{product.name}</span></div><section className="product-detail container"><div className={`detail-image ${product.accent}`}><img src={product.image} alt={product.name} /><span className="detail-badge">{product.badge ?? "good choice"}</span></div><div className="detail-content"><span className="eyebrow">your everyday plus-one</span><h1>{product.name}</h1><div className="detail-price"><strong>{money(product.price)}</strong><span>★★★★★ 4.9 / 5 reviews</span></div><p className="detail-lede">A familiar favorite, with a little Rooki energy. Our soft, 100% cotton bandana is ready for your neck, hair, bag, and whatever your day has in mind.</p><div className="color-picker"><span>color: {product.color}</span><i className={`swatch ${product.accent}`} /><i className="swatch blue" /><i className="swatch green" /></div><div className="buy-row"><div className="quantity"><button onClick={() => setQty(Math.max(1, qty - 1))}><Minus size={13} /></button><span>{qty}</span><button onClick={() => setQty(qty + 1)}><Plus size={13} /></button></div><button className="primary-button" onClick={() => onAdd(product, qty)}>add to bag — {money(product.price * qty)} <ShoppingBag size={15} /></button></div><p className="detail-shipping">Free US shipping over $50 · Easy 30-day returns</p><div className="accordion-list">{accordions.map(([title, copy]) => <div className="accordion" key={title}><button onClick={() => setOpen(open === title ? "" : title)}><span>{title}</span>{open === title ? <ChevronUp size={15} /> : <ChevronDown size={15} />}</button>{open === title && <p>{copy}</p>}</div>)}</div></div></section><TrustBar /><ProductCampaign product={product} />
    <section className="classic-story container"><div className="yellow-panel"><span className="eyebrow">tie it. twist it. do your thing.</span><h2>Classic pattern.<br /><em>Very you energy.</em></h2><p>The square that goes everywhere. Keep it casual with a loose neck knot, make a headband, or give your favorite tote a little personality.</p><button className="outline-button" onClick={() => onNavigate("/ways-to-wear")}>show me how to wear <ArrowUpRight size={15} /></button></div><img src={product.modelImage} alt={`Styling ${product.name}`} /></section><section className="reviews container"><div className="section-top"><h2>A very good little square.</h2><span>★★★★★ 4.9 out of 5</span></div><div className="review-grid"><blockquote>“Soft from the first wear. The Cherry color makes even a plain tee feel like an outfit.”<cite>Alex M. · verified buyer</cite></blockquote><blockquote>“One for me, one for a friend. The perfect size for a neck tie.”<cite>Jamie L. · verified buyer</cite></blockquote><blockquote>“Goes where I go. A small thing with very good energy.”<cite>Sam R. · verified buyer</cite></blockquote></div></section><CollectionSection onNavigate={onNavigate} onAdd={(item) => onAdd(item)} /></div>;
}

function Story({ onNavigate }: { onNavigate: (path: string) => void }) {
  return <div className="page-wrap story-page"><section className="story-intro container"><div className="lavender-panel"><span className="eyebrow">the rooki way</span><h1>Less ordinary.<br /><em>More you.</em></h1><p>We make good-feeling bandanas for real life, in all its colorful, wonderfully messy glory.</p></div><img src={image("male-bandana-portrait.jpg")} alt="Bold colorful fashion" /></section><section className="story-copy blue-panel"><span className="eyebrow">the good idea</span><h2>Useful things can<br /><em>still be joyful.</em></h2><p>Rooki Goods started with a small square and a very big belief: the things you use every day should bring a little energy with them.</p></section><section className="story-principles container"><div><span>01</span><h3>good<br /><em>materials.</em></h3><p>100% cotton, made to wear, wash, rewear and keep.</p></div><div><span>02</span><h3>good<br /><em>energy.</em></h3><p>Color that makes a regular Tuesday feel a little less regular.</p></div><div><span>03</span><h3>good<br /><em>company.</em></h3><p>For anyone. For every day. For all the ways you make it yours.</p></div></section><section className="story-final container peach-panel"><img src={image("male-bandana-resting.jpg")} alt="Colorful fabric detail" /><div><h2>Come as<br /><em>you are.</em></h2><button className="dark-button" onClick={() => onNavigate("/shop")}>shop the bandanas <ArrowUpRight size={15} /></button></div></section><EmailSignup /></div>;
}

function WaysToWear({ onNavigate }: { onNavigate: (path: string) => void }) {
  const steps = [
    { number: "01 / YOUR EVERYDAY GO-TO", title: "The neck tie", copy: "A little French classic. A little weekend wander. A whole lot of personality for your favorite tee.", image: "male-bandana-portrait.jpg", panel: "yellow-panel", action: "shop The Classic — $24" },
    { number: "02 / GOOD HAIR, ANY DAY", title: "The head scarf", copy: "Sunshine, errands, a flower-market detour. An easy way to keep your hair back and your mood up.", image: "male-bandana-portrait.jpg", panel: "lavender-panel", action: "shop The Daydream — $24" },
    { number: "03 / YOUR BAG'S NEW BEST FRIEND", title: "The bag buddy", copy: "Same beloved bandana. Brand-new energy. Tie it to your tote, wrap the handle, or loop it around your favorite carry-all.", image: "male-bandana-profile.jpg", panel: "peach-panel", action: "shop The Field Trip — $24" },
  ];
  return <div className="page-wrap ways-page"><section className="ways-hero container"><div className="lavender-panel"><span className="eyebrow">one bandana. endless possibilities.</span><h1>No right way.<br /><em>Just your way.</em></h1><p>Around your neck, in your hair, on your favorite bag. Start with these easy ideas, then add a little you.</p><div className="ways-tabs"><span>the neck tie</span><span>the head scarf</span><span>the bag buddy</span></div></div><img src={image("male-bandana-profile.jpg")} alt="Colorful personal style" /></section><section className="ways-start container"><div><span className="eyebrow">first, try the easy bit</span><h2>One square. Two<br /><em>starting folds.</em></h2></div><div className="fold-cards"><div><strong>↗ The triangle</strong><p>Bring one corner to the opposite corner. Smooth the fold.</p></div><div><strong>↔ The rolled strip</strong><p>Start with a triangle. Fold from the long edge toward the point.</p></div></div></section>{steps.map((step) => <section className={`wear-step container ${step.panel}`} key={step.title}><img src={image(step.image)} alt={step.title} /><div><span className="eyebrow">{step.number}</span><h2>{step.title}</h2><p>{step.copy}</p><div className="step-list"><span>1</span><span>2</span><span>3</span></div><button className="dark-button" onClick={() => onNavigate("/shop")}>{step.action} <ArrowUpRight size={15} /></button></div></section>)}<section className="ways-cta blue-panel"><h2>The best look? The one that<br /><em>feels like you.</em></h2><p>Try a twist. Dress up a ponytail. Share your little twist with @rookigoods.</p></section><EmailSignup /></div>;
}

function BagPage({ cart, subtotal, onNavigate, onUpdate, onRemove, onAdd }: { cart: CartItem[]; subtotal: number; onNavigate: (path: string) => void; onUpdate: (id: string, qty: number) => void; onRemove: (id: string) => void; onAdd: (product: Product) => void }) {
  const shipping = subtotal >= 50 ? 0 : cart.length ? 6 : 0;
  return <div className="page-wrap bag-page"><section className="bag-heading container"><div><span className="eyebrow">good choices. good energy.</span><h1>Your happy<br /><em>little haul.</em></h1></div><span>your bag · {cart.reduce((sum, item) => sum + item.qty, 0)} items</span></section>{cart.length === 0 ? <div className="empty-state container"><h2>Nothing here yet.</h2><p>But there are lots of good things waiting for you.</p><button className="dark-button" onClick={() => onNavigate("/shop")}>shop all bandanas <ArrowUpRight size={15} /></button></div> : <section className="bag-layout container"><div className="bag-items"><div className="shipping-banner"><strong>{shipping === 0 ? "Good things, delivered for free." : "A little more for free shipping."}</strong><span>{shipping === 0 ? "Your order qualifies for free standard US shipping. Nice one!" : `You're $${Math.max(0, 50 - subtotal).toFixed(2)} away from free shipping.`}</span></div>{cart.map((item) => <BagLine key={item.id} item={item} onUpdate={onUpdate} onRemove={onRemove} />)}<div className="bag-note">One for you, one for a friend? Every square comes ready for a little everyday adventure.</div><button className="outline-button" onClick={() => onNavigate("/shop")}><ArrowLeft size={15} /> keep exploring</button></div><OrderSummary cart={cart} subtotal={subtotal} shipping={shipping} onNavigate={onNavigate} /></section>}<TrustBar /><CollectionSection onNavigate={onNavigate} onAdd={onAdd} /></div>;
}

function BagLine({ item, onUpdate, onRemove }: { item: CartItem; onUpdate: (id: string, qty: number) => void; onRemove: (id: string) => void }) {
  return <div className="bag-line"><img src={item.image} alt={item.name} /><div><h3>{item.name}</h3><p>{item.color} / 22 × 22 in</p><small>{money(item.price)} each</small><div className="line-controls"><div className="quantity"><button onClick={() => onUpdate(item.id, item.qty - 1)}><Minus size={13} /></button><span>{item.qty}</span><button onClick={() => onUpdate(item.id, item.qty + 1)}><Plus size={13} /></button></div><button className="remove-link" onClick={() => onRemove(item.id)}>remove</button></div></div><strong>{money(item.price * item.qty)}</strong></div>;
}

function OrderSummary({ cart, subtotal, shipping, onNavigate }: { cart: CartItem[]; subtotal: number; shipping: number; onNavigate: (path: string) => void }) {
  return <aside className="order-summary"><h2>Order summary</h2><p className="summary-muted">Delivery estimate for Portland, OR 97209</p>{cart.map((item) => <div className="mini-summary" key={item.id}><img src={item.image} alt="" /><div><strong>{item.name}</strong><span>{item.color} / Qty {item.qty}</span></div><b>{money(item.price * item.qty)}</b></div>)}<div className="totals"><span>Subtotal <b>{money(subtotal)}</b></span><span>Standard shipping <b>{shipping === 0 ? "FREE" : money(shipping)}</b></span><span>Tax · Oregon <b>$0.00</b></span><span className="total">Total <b>{money(subtotal + shipping)}</b></span></div><button className="primary-button full" onClick={() => onNavigate("/checkout")}>checkout — {money(subtotal + shipping)} <ArrowRight size={15} /></button><small className="summary-muted">Secure checkout · Visa · Mastercard · American Express</small></aside>;
}

function Checkout({ cart, subtotal, onNavigate, onUpdate, onRemove, setCart }: { cart: CartItem[]; subtotal: number; onNavigate: (path: string) => void; onUpdate: (id: string, qty: number) => void; onRemove: (id: string) => void; setCart: React.Dispatch<React.SetStateAction<CartItem[]>> }) {
  const shipping = subtotal >= 50 ? 0 : 6;
  if (!cart.length) return <div className="empty-state checkout-empty container"><h1>Let’s send some good<br /><em>your way.</em></h1><p>Your bag is empty. Add a bandana first.</p><button className="dark-button" onClick={() => onNavigate("/shop")}>shop all bandanas <ArrowUpRight size={15} /></button></div>;
  return <div className="checkout-page page-wrap"><div className="checkout-crumbs container"><button onClick={() => onNavigate("/bag")}><ArrowLeft size={14} /> bag</button><span>/ checkout / confirmation</span><span>encrypted & secure · all prices in USD</span></div><section className="checkout-layout container"><form className="checkout-form" onSubmit={(event) => { event.preventDefault(); setCart([]); onNavigate("/confirmation"); }}><span className="eyebrow">almost yours.</span><h1>Let’s send some good<br /><em>your way.</em></h1><CheckoutSection number="1" title="Your contact"><p>Checking out as a guest. Already part of the crew? Sign in</p><label>Email address<input type="email" placeholder="alex.morgan@example.com" required /></label><label className="check-label"><input type="checkbox" /> Send me fresh colors, fun ideas, and good mail.</label></CheckoutSection><CheckoutSection number="2" title="Where’s it going?"><div className="field-grid"><label>First name<input placeholder="Alex" required /></label><label>Last name<input placeholder="Morgan" required /></label></div><label>Country / region<select defaultValue="United States"><option>United States</option><option>Canada</option></select></label><label>Street address<input placeholder="128 NW 12th Avenue" required /></label><label>Apartment, suite, etc. <span>(optional)</span><input placeholder="Apt 4" /></label><div className="field-grid three"><label>City<input placeholder="Portland" required /></label><label>State<select defaultValue="Oregon"><option>Oregon</option><option>California</option><option>New York</option></select></label><label>ZIP code<input placeholder="97209" required /></label></div><label>Phone <span>(optional, for delivery updates)</span><input placeholder="(503) 555-0142" /></label></CheckoutSection><CheckoutSection number="3" title="Pick your good mail day"><div className="delivery-choice"><label><input type="radio" name="delivery" defaultChecked /> <span><b>Standard delivery · {shipping === 0 ? "FREE" : money(shipping)}</b><small>3–5 business days · Arrives November 3–5</small></span></label><label><input type="radio" name="delivery" /> <span><b>Express delivery · $12.00</b><small>1–2 business days · Arrives October 30–November 2</small></span></label></div></CheckoutSection><CheckoutSection number="4" title="The final little detail"><p>Your payment details are encrypted and protected.</p><div className="payment-card"><label><input type="radio" name="payment" defaultChecked /> Credit or debit card</label><label>Name on card<input placeholder="Alex Morgan" required /></label><label>Card number<input placeholder="•••• •••• •••• 4242" required /></label><div className="field-grid"><label>Expiration date<input placeholder="08 / 28" required /></label><label>Security code<input placeholder="•••" required /></label></div><label><input type="radio" name="payment" /> PayPal</label></div><label className="check-label"><input type="checkbox" defaultChecked /> Billing address is the same as shipping address</label></CheckoutSection><button className="primary-button full" type="submit">pay {money(subtotal + shipping)} & place order <ArrowRight size={15} /></button><p className="checkout-footnote">By placing your order, you agree to our Terms of service and Privacy policy. You’ll receive a confirmation by email.</p></form><OrderSummary cart={cart} subtotal={subtotal} shipping={shipping} onNavigate={onNavigate} /></section></div>;
}

function CheckoutSection({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return <section className="checkout-section"><h2><span>{number}</span>{title}</h2>{children}</section>;
}

function Confirmation({ onNavigate }: { onNavigate: (path: string) => void }) {
  return <div className="confirmation-page page-wrap"><section className="confirmation-hero"><div className="container"><span className="eyebrow">order RG–1029 · October 29, 2026</span><h1>You’ve got good<br /><em>things coming.</em></h1><p>Your order is confirmed. We’ll get your little squares ready for their next adventure.</p><span className="confirmation-sticker"><Check size={22} /><b>Good choice.<br />Great energy.</b></span></div></section><section className="confirmation-layout container"><div><div className="confirmed-banner"><b>All set. We’ll take it from here.</b><span>Payment received · Visa ending in 4242 · $72.00 USD</span></div><div className="delivery-card"><span className="eyebrow">your next good mail day</span><h2>November 3–5</h2><p>Standard US delivery · 3–5 business days · FREE</p><div className="tracking"><span><i>✓</i><b>Confirmed</b><small>October 29</small></span><span><i>2</i><b>On its way</b><small>Tracking by email</small></span><span><i>3</i><b>At your door</b><small>November 3–5</small></span></div></div><div className="confirmation-cards"><div><h3>Shipping to</h3><p>Alex Morgan<br />128 NW 12th Avenue, Apt 4<br />Portland, OR 97209<br />United States</p></div><div><h3>Payment & billing</h3><p>Visa ending in 4242<br />Paid $72.00 USD<br />Billing address same as shipping.</p></div></div><h2 className="next-heading">Here’s what happens next.</h2><p className="next-copy">We’ll pack your order with care and email your tracking link when it’s on its way. Keep your order number RG-1029 handy if you need us.</p><button className="primary-button" onClick={() => onNavigate("/shop")}>keep the good going <ArrowRight size={15} /></button></div><OrderSummary cart={products.slice(0, 2).map((product, index) => ({ ...product, qty: index === 0 ? 2 : 1 }))} subtotal={72} shipping={0} onNavigate={onNavigate} /></section><section className="confirmation-cta lavender-feature container"><img src={image("male-bandana-profile.jpg")} alt="Bandana styling" /><div><span className="eyebrow">while your good things are on their way</span><h2>Plan your first<br /><em>little twist.</em></h2><button className="outline-button" onClick={() => onNavigate("/ways-to-wear")}>a few ways to rooki <ArrowUpRight size={15} /></button></div></section><EmailSignup /></div>;
}

function CartDrawer({ cart, subtotal, onClose, onNavigate, onUpdate, onRemove }: { cart: CartItem[]; subtotal: number; onClose: () => void; onNavigate: (path: string) => void; onUpdate: (id: string, qty: number) => void; onRemove: (id: string) => void }) {
  return <div className="drawer-layer" onClick={onClose}><aside className="cart-drawer" onClick={(event) => event.stopPropagation()}><div className="drawer-heading"><div><span className="eyebrow">your bag</span><h2>good choices.</h2></div><button className="header-icon" onClick={onClose}><X size={18} /></button></div>{cart.length ? <><div className="drawer-lines">{cart.map((item) => <BagLine key={item.id} item={item} onUpdate={onUpdate} onRemove={onRemove} />)}</div><div className="drawer-subtotal"><span>subtotal</span><b>{money(subtotal)}</b></div><button className="primary-button full" onClick={() => onNavigate("/bag")}>view your bag <ArrowRight size={15} /></button></> : <div className="drawer-empty"><div>✦</div><h3>your bag is waiting.</h3><p>Pick a little square for your next everyday adventure.</p><button className="dark-button" onClick={() => onNavigate("/shop")}>shop bandanas <ArrowUpRight size={15} /></button></div>}</aside></div>;
}

function EmailSignup() {
  return <section className="email-signup"><div className="container"><div><h2>A little good in your inbox.</h2><p>Fresh colors, fun ideas, and 10% off your first order. Good mail only.</p><form onSubmit={(event) => event.preventDefault()}><input type="email" placeholder="your email address" aria-label="Your email" required /><button type="submit">I’m in</button></form></div><div className="footer-links"><div><span>the good stuff</span><a href="#/shop">all bandanas</a><a href="#/shop">bestsellers</a><a href="#/shop">new arrivals</a><a href="#/shop">gift cards</a></div><div><span>our little world</span><a href="#/story">our story</a><a href="#/ways-to-wear">how to wear</a><a href="#instagram">instagram</a><a href="mailto:hello@rookigoods.com">hello@rookigoods.com</a></div></div></div><div className="footer-wordmark container">rooki <span>goods</span><sup>®</sup></div></section>;
}

function Footer({ onNavigate }: { onNavigate: (path: string) => void }) {
  return <footer className="site-footer"><div className="container footer-top"><button onClick={() => onNavigate("/")}>rooki goods<sup>®</sup></button><span>For anyone.<br />For every day.</span></div><div className="container footer-bottom"><span>© 2026 Rooki Goods. A little color goes a long way.</span><span>privacy policy　 terms of service　 United States / USD $</span></div></footer>;
}

function NotFound({ onNavigate }: { onNavigate: (path: string) => void }) {
  return <div className="empty-state container"><span className="eyebrow">404 / oops</span><h1>this page<br /><em>wandered off.</em></h1><button className="dark-button" onClick={() => onNavigate("/")}>back home <ArrowUpRight size={15} /></button></div>;
}
