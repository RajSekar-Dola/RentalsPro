const filterProducts = (
    products = [],
    productType,
    productName,
    locationName,
    fromDateTime,
    toDateTime,
    minprice,
    maxprice,
  ) => {
    return products.filter(product => {
      const matchesType = !productType || product.productType === productType;
      const matchesLocation = !locationName || product.locationName === locationName;
      const matchesFromDate = !fromDateTime || (new Date(product.fromDateTime) <= new Date(fromDateTime) && new Date(product.toDateTime) >= new Date(fromDateTime));
      const matchesToDate =new Date(product.toDateTime) >= new Date()&&( !toDateTime || new Date(product.toDateTime) >= new Date(toDateTime));
      const matchesmaxPrice = !maxprice ||product.price<=maxprice;
      const matchesminPrice = !minprice ||product.price>=minprice;
      const matchesName = !productName || product.productName.toLowerCase().includes(productName.toLowerCase());
  
      return (!product.expired) && matchesType && matchesLocation && matchesFromDate && matchesToDate && matchesmaxPrice && matchesminPrice&& matchesName;
    });
  };

export {filterProducts};