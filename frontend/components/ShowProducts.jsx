import React from 'react';
import ItemCard from './ItemCard';
import "../css/ShowProducts.css";

function ShowProducts({ products, frombookingdate, tobookingdate }) {
  return (
      <div className="product-list">
        {products.length > 0 ? (
          products.map((product) => (
            <ItemCard
              key={product._id}
              product_id={product._id}
              username={product.username}
              productType={product.productType}
              productName={product.productName}
              locationName={product.locationName}
              fromDateTime={
                frombookingdate
                  ? new Date(frombookingdate).toLocaleString()
                  : new Date(product.fromDateTime).toLocaleString()
              }
              toDateTime={
                tobookingdate
                  ? new Date(tobookingdate).toLocaleString()
                  : new Date(product.toDateTime).toLocaleString()
              }
              price={product.price}
              photo={product.photo[0]}
              frombookingdate={frombookingdate}
              tobookingdate={tobookingdate}
            />
          ))
        ) : (
          <div>No products available</div>
        )}
      </div>
  );
}

export default ShowProducts;

