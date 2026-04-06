import { useNavigate } from "react-router-dom";
import { MdDelete, MdLocalShipping, MdShoppingCart } from "react-icons/md";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import {
  formatCurrency,
  getProductImage,
  handleProductImageError,
} from "../utils/formatters";

export default function CartPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, cartCount, removeFromCart, total, updateQuantity } = useCart();

  const handleCheckout = () => {
    if (!user) {
      localStorage.setItem("redirectAfterLogin", "/order");
      navigate("/login");
      return;
    }

    navigate("/order");
  };

  if (cart.length === 0) {
    return (
      <div className="page">
        <div className="container section">
          <div className="state-card">
            <MdShoppingCart size={42} />
            <h2>السلة فارغة</h2>
            <p>أضف بعض المنتجات أولًا ثم ارجع هنا لإكمال الطلب.</p>
            <button className="button button--primary" onClick={() => navigate("/products")} type="button">
              تصفح المنتجات
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <section className="page-hero page-hero--compact">
        <div className="container page-hero__content">
          <span className="eyebrow eyebrow--solid">سلة الشراء</span>
          <h1>راجع المنتجات قبل إتمام الطلب</h1>
          <p>تفاصيل أوضح، تحكم أسهل في الكميات، وملخص فوري للتكلفة النهائية.</p>
        </div>
      </section>

      <section className="container section cart-layout">
        <div className="cart-items">
          {cart.map((item) => (
            <article className="cart-item" key={item._id}>
              <img
                alt={item.name}
                onError={handleProductImageError}
                src={getProductImage(item)}
              />

              <div className="cart-item__info">
                <span className="eyebrow">{item.category}</span>
                <h2>{item.name}</h2>
                <p>{formatCurrency(item.price)}</p>
              </div>

              <div className="cart-item__actions">
                <div className="stepper">
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    type="button"
                  >
                    -
                  </button>
                  <strong>{item.quantity}</strong>
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    type="button"
                  >
                    +
                  </button>
                </div>
                <strong>{formatCurrency(item.price * item.quantity)}</strong>
                <button
                  className="icon-button"
                  onClick={() => removeFromCart(item._id)}
                  type="button"
                >
                  <MdDelete size={18} />
                </button>
              </div>
            </article>
          ))}
        </div>

        <aside className="summary-card">
          <h2>ملخص الطلب</h2>
          <div className="summary-card__rows">
            <div>
              <span>عدد القطع</span>
              <strong>{cartCount}</strong>
            </div>
            <div>
              <span>الإجمالي الفرعي</span>
              <strong>{formatCurrency(total)}</strong>
            </div>
            <div>
              <span>
                <MdLocalShipping size={16} />
                الشحن
              </span>
              <strong>مجاني</strong>
            </div>
          </div>

          <div className="summary-card__total">
            <span>الإجمالي النهائي</span>
            <strong>{formatCurrency(total)}</strong>
          </div>

          <button className="button button--primary button--large" onClick={handleCheckout} type="button">
            إتمام الطلب
          </button>
          <button className="button button--secondary" onClick={() => navigate("/products")} type="button">
            متابعة التسوق
          </button>
        </aside>
      </section>
    </div>
  );
}
