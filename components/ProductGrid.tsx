import Link from "next/link";
import {
  PRODUCTS,
  PRODUCT_STATUS_COLOR,
  PRODUCT_STATUS_LABEL,
  type Product,
} from "@/lib/products";

/**
 * The three-product suite grid. Rendered on the homepage and, with
 * `exclude`, on each product page as a "the rest of the suite" footer so a
 * visitor who lands deep never has to go back to / to find the other two.
 */
export default function ProductGrid({ exclude }: { exclude?: string }) {
  const items = PRODUCTS.filter((p) => p.href !== exclude);
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(auto-fit, minmax(300px, 1fr))`,
        gap: 20,
        marginTop: 40,
      }}
    >
      {items.map((p) => (
        <ProductCard key={p.href} product={p} />
      ))}
    </div>
  );
}

function ProductCard({ product: p }: { product: Product }) {
  const statusColor = PRODUCT_STATUS_COLOR[p.status];
  return (
    <Link
      href={p.href}
      className="product-card"
      style={{
        borderColor: `color-mix(in srgb, ${p.color} 34%, transparent)`,
      }}
    >
      <div className="product-card-top">
        <span className="product-card-short" style={{ color: p.color }}>
          {p.short}
        </span>
        <span
          className="product-card-status"
          style={{
            color: statusColor,
            background: `color-mix(in srgb, ${statusColor} 12%, transparent)`,
            borderColor: `color-mix(in srgb, ${statusColor} 34%, transparent)`,
          }}
        >
          <span className="product-card-dot" style={{ background: statusColor }} />
          {PRODUCT_STATUS_LABEL[p.status]}
        </span>
      </div>

      <h3 className="product-card-name">{p.name}</h3>
      <div className="product-card-role">{p.role}</div>
      <p className="product-card-desc">{p.desc}</p>

      <ul className="product-card-bullets">
        {p.bullets.map((b) => (
          <li key={b}>
            <span style={{ color: p.color }} aria-hidden>
              ▸
            </span>
            {b}
          </li>
        ))}
      </ul>

      <div className="product-card-foot">
        {p.command ? <code className="product-card-cmd">{p.command}</code> : <span />}
        <span className="product-card-more" style={{ color: p.color }}>
          Explore <span className="arrow">→</span>
        </span>
      </div>
    </Link>
  );
}
