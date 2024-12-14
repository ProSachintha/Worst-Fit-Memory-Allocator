

const WorstFitAllocator = () => {
  



  return (
    <div style={{ padding: '20px', fontFamily: 'Arial'  }}>
      <h1 style={{textAlign:'center'}}>Worst Fit Memory Allocator</h1>
      <h2 style={{textAlign:'center'}}>B.V.G.S.S.Gunawardhana | 221438175</h2>

      <div style={{textAlign:'center'}}>
        <h2>Allocate Memory</h2>
        <input
          type="number"
          value=""
          placeholder="Enter size to allocate"
        />
        <button >Allocate</button>
        <p style={{ color: 'red' }}></p>
      </div>
        <div style={{display:'flex' , flexDerection:'row', justifyContent:'space-around'}}>

          <div>
            <h2>Memory Pool (Free Blocks)</h2>
            <ul>
              
                <li>
                  Block ID: 1 , Free Size: 100  bytes (Total: 100)
                </li>
                <li>
                  Block ID: 2 , Free Size: 500 bytes (Total: 500)
                </li>
                <li>
                  Block ID: 3, Free Size: 200 bytes (Total: 200)
                </li>
                <li>
                  Block ID: 4, Free Size: 300 bytes (Total: 300)
                </li>
              
            </ul>
          </div>

          <div>
            <h2>Allocated Blocks</h2>
            <ul>
              
                <li>
                  Sub Block ID: 2.1 , Size: 100 bytes{' '}
                  <button>Free</button>
                </li>
              
            </ul>
          </div>
        </div>
      </div>
  );
};

export default WorstFitAllocator;