import React, { useEffect, useState } from 'react'
import './NewCollections.css'
import Item from '../Item/Item';

const NewCollection = () => {

  const [new_collection, setNew_collection] = useState([]);
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetch(`${API_URL}/newcollections`)
      .then((response) => response.json())
      .then((data) => setNew_collection(data))
      .catch(err => console.error(err));
  }, [API_URL]);

  return (
    <div className='new-collections'>
      <h1>NEW COLLECTIONS</h1>
      <hr />
      <div className="collections">
        {new_collection.map((item, i) => (
          <Item
            key={i}
            id={item.id}
            name={item.name}
            image={item.image}
            new_price={item.new_price}
            old_price={item.old_price}
          />
        ))}
      </div>
    </div>
  )
}

export default NewCollection;