async function checkConflict(productId, fromDateTime, toDateTime) {
  try {
      const response = await fetch('http://localhost:3000/checkconflict', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              product_id: productId,
              fromDateTime: fromDateTime,
              toDateTime: toDateTime,
          }),
          credentials:include,
      });
      console.log(fromDateTime,toDateTime);
      if (response.ok) {
          const data = await response.json();
          
          return data.conflict;
            // Return true or false based on the response
      } else {
          return false; // Return false in case of error
      }
  } catch (error) {
      return false; // Return false in case of an exception
  }
}
async function conflict(id,fromDateTime, toDateTime){
  const hasConflict = await checkConflict(id, fromDateTime, toDateTime);
  if(hasConflict){return true;}
    else{return false};
}
const filterProducts =(
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
      // const hasConflict = await checkConflict(product._id, fromDateTime, toDateTime);

      const conflictcheckfrom=new Date(fromDateTime)
      const conflictcheckto=new Date(toDateTime)

      return (!product.expired) && matchesType && matchesLocation && matchesFromDate && matchesToDate && matchesmaxPrice && matchesminPrice&& matchesName;
    });
  };

export {filterProducts};