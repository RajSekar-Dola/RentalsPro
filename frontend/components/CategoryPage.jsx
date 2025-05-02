import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../css/CategoryPage.css";
import ShowProducts from "./ShowProducts";
import SearchBar from "./SearchBar";
import Location from "./Location";
import { filterProducts } from "./FilterProducts.js";
import DateTimeFilter from "./DateTimeFilter.jsx";
import PriceFilter from "./PriceFilter.jsx";
export default function Category() {
  const { category } = useParams();
  const [items, setItems] = useState([]); // State for filtered items
  const [originalItems, setOriginalItems] = useState([]); // State for original fetched items
  const [searchinput,setsearchinput] =useState("");
  const [location,setlocation]=useState("");
  const [fromdatetime,setfromdatetime]=useState();
  const [todatetime,settodatetime]=useState();
  const [minprice,setminprice]=useState(0);
  const [maxprice,setmaxprice]=useState();
  useEffect(() => {
    const fetchoriginalitems = async () => {
      try {
        const response = await fetch('http://localhost:3000/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({productType:category}),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setItems(data);
        setOriginalItems(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchoriginalitems();
  }, [category]);


useEffect(()=>{
  if (originalItems.length > 0){
  const fp=filterProducts(originalItems,undefined,searchinput,location,fromdatetime,todatetime,minprice,maxprice);
  setItems(fp);
  }
},[location,searchinput,fromdatetime,todatetime,originalItems,minprice,maxprice]);



  return (
    <div className="category-page">
      {/* <h1 className="categoryhead">{category.charAt(0).toUpperCase() + category.slice(1)}</h1> */}

      <div id="central">
      <div id="left">
      <div id="filter" data-testid="filters-section">
        <SearchBar setsearchinput={setsearchinput} />
        <Location setlocation={setlocation}/>
        <DateTimeFilter data-testid="datetime-filter" setfromdatetime={setfromdatetime} settodatetime={settodatetime}/>
        <PriceFilter data-testid="price-filter" setminprice={setminprice} setmaxprice={setmaxprice}/>
      </div>
      </div>

      <div id="right">

      <ul>
        <ShowProducts products={items} frombookingdate={fromdatetime} tobookingdate={todatetime}/>
      </ul>
      </div>

      </div>

    </div>
  );
}