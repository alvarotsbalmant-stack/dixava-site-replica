
import React from "react";

const DixavaContent: React.FC = () => {
  return (
    <div className="dixava-content">
      <header className="dixava-header">
        <div className="logo-container">
          <img src="/dixava-logo.png" alt="Dixava Logo" className="dixava-logo" />
        </div>
        <nav className="main-nav">
          <ul>
            <li><a href="#inicio">Início</a></li>
            <li><a href="#produtos">Produtos</a></li>
            <li><a href="#sobre">Sobre Nós</a></li>
            <li><a href="#contato">Contato</a></li>
          </ul>
        </nav>
      </header>

      <section className="hero-section">
        <div className="hero-content">
          <h1>Bem-vindo à Dixava</h1>
          <p>Produtos exclusivos para seu estilo único</p>
          <button className="cta-button">Comprar Agora</button>
        </div>
      </section>

      <section id="produtos" className="products-section">
        <h2>Nossos Produtos</h2>
        <div className="product-grid">
          <div className="product-card">
            <div className="product-image"></div>
            <h3>Produto 1</h3>
            <p>Descrição do produto com detalhes importantes</p>
            <span className="product-price">R$ 99,90</span>
            <button className="add-cart-button">Adicionar ao Carrinho</button>
          </div>
          <div className="product-card">
            <div className="product-image"></div>
            <h3>Produto 2</h3>
            <p>Descrição do produto com detalhes importantes</p>
            <span className="product-price">R$ 129,90</span>
            <button className="add-cart-button">Adicionar ao Carrinho</button>
          </div>
          <div className="product-card">
            <div className="product-image"></div>
            <h3>Produto 3</h3>
            <p>Descrição do produto com detalhes importantes</p>
            <span className="product-price">R$ 79,90</span>
            <button className="add-cart-button">Adicionar ao Carrinho</button>
          </div>
        </div>
      </section>

      <section id="sobre" className="about-section">
        <div className="about-content">
          <h2>Sobre a Dixava</h2>
          <p>A Dixava é uma loja especializada em produtos exclusivos, focada em qualidade e inovação. Nossa missão é oferecer produtos que combinem estilo, funcionalidade e preços acessíveis.</p>
          <p>Fundada em 2023, nossa empresa cresce constantemente graças à satisfação de nossos clientes.</p>
        </div>
      </section>

      <section id="contato" className="contact-section">
        <h2>Entre em Contato</h2>
        <form className="contact-form">
          <div className="form-group">
            <label htmlFor="name">Nome</label>
            <input type="text" id="name" name="name" required />
          </div>
          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input type="email" id="email" name="email" required />
          </div>
          <div className="form-group">
            <label htmlFor="message">Mensagem</label>
            <textarea id="message" name="message" rows={5} required></textarea>
          </div>
          <button type="submit" className="submit-button">Enviar Mensagem</button>
        </form>
      </section>
    </div>
  );
};

export default DixavaContent;
