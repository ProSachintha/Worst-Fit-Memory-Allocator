

import React, { useState } from 'react';

const WorstFitAllocator = () => {
  const [memoryPool, setMemoryPool] = useState([
    { id: 1, size: 100, totalSize: 100, subBlocks: [] },
    { id: 2, size: 500, totalSize: 500, subBlocks: [] },
    { id: 3, size: 200, totalSize: 200, subBlocks: [] },
    { id: 4, size: 300, totalSize: 300, subBlocks: [] },
  ]);
  const [allocatedBlocks, setAllocatedBlocks] = useState([]);
  const [allocationSize, setAllocationSize] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const allocateMemory = () => {
    const size = parseInt(allocationSize);
    if (isNaN(size) || size <= 0) {
      setErrorMessage('Please enter a valid size.');
      return;
    }
    setErrorMessage('');

    // Find all blocks with free sub-blocks first
    const freeSubBlockOptions = memoryPool.flatMap((block, blockIndex) => 
      block.subBlocks
        .filter(subBlock => subBlock.status === 'free' && subBlock.size >= size)
        .map(subBlock => ({
          blockIndex,
          subBlockIndex: block.subBlocks.indexOf(subBlock),
          size: subBlock.size
        }))
    );

    // If free sub-block is available, use it first
    if (freeSubBlockOptions.length > 0) {
      // Find the largest free sub-block (worst fit)
      const bestFreeSubBlock = freeSubBlockOptions.reduce((max, current) => 
        current.size > max.size ? current : max
      );

      let newSubBlockId = ''; // Declare the variable here

      const updatedMemoryPool = memoryPool.map((block, blockIndex) => {
        if (blockIndex === bestFreeSubBlock.blockIndex) {
          const updatedSubBlocks = [...block.subBlocks];
          const existingSubBlock = updatedSubBlocks[bestFreeSubBlock.subBlockIndex];
          
          // Create new sub-block
          newSubBlockId = `${block.id}.${existingSubBlock.id.split('.').pop()}`;
          const newSubBlock = { 
            id: newSubBlockId, 
            size, 
            status: 'allocated' 
          };

          // Update existing sub-block
          if (existingSubBlock.size > size) {
            updatedSubBlocks[bestFreeSubBlock.subBlockIndex] = {
              ...existingSubBlock,
              size: existingSubBlock.size - size,
              status: 'free'
            };
            updatedSubBlocks.splice(bestFreeSubBlock.subBlockIndex, 0, newSubBlock);
          } else {
            updatedSubBlocks[bestFreeSubBlock.subBlockIndex] = {
              ...newSubBlock,
              status: 'allocated'
            };
          }

          return { 
            ...block, 
            size: block.size - size, 
            subBlocks: updatedSubBlocks 
          };
        }
        return block;
      });

      setMemoryPool(updatedMemoryPool);
      setAllocatedBlocks([...allocatedBlocks, 
        { id: newSubBlockId, size, status: 'allocated' }
      ]);
      setAllocationSize('');
      return;
    }

    // If no free sub-block, proceed with original worst-fit allocation
    let worstFitIndex = -1;
    memoryPool.forEach((block, index) => {
      if (block.size >= size) {
        if (worstFitIndex === -1 || block.size > memoryPool[worstFitIndex].size) {
          worstFitIndex = index;
        }
      }
    });

    if (worstFitIndex === -1) {
      setErrorMessage('No suitable block found.');
      return;
    }

    // Allocate memory
    const block = memoryPool[worstFitIndex];
    const subBlockId = `${block.id}.${block.subBlocks.length + 1}`;
    const newSubBlock = { id: subBlockId, size, status: 'allocated' };
    const updatedSubBlocks = [...block.subBlocks, newSubBlock];

    // Adjust memory pool
    const remainingSize = block.size - size;
    const updatedMemoryPool = memoryPool.map((b, index) => 
      index === worstFitIndex 
        ? { ...b, size: remainingSize, subBlocks: updatedSubBlocks }
        : b
    );

    setMemoryPool(updatedMemoryPool);
    setAllocatedBlocks([...allocatedBlocks, newSubBlock]);
    setAllocationSize('');
  };

  const freeMemory = (subBlockId) => {
    const updatedMemoryPool = memoryPool.map((block) => {
      // Find the sub-block to free
      const subBlockIndex = block.subBlocks.findIndex((subBlock) => subBlock.id === subBlockId);
      
      if (subBlockIndex !== -1) {
        const freedSubBlock = block.subBlocks[subBlockIndex];
        let updatedSubBlocks = [...block.subBlocks];
        
        // Mark the sub-block as free
        updatedSubBlocks[subBlockIndex] = { ...freedSubBlock, status: 'free' };
        
        // Calculate used size by allocated sub-blocks
        const allocatedSubBlocksSize = updatedSubBlocks
          .filter(sb => sb.status === 'allocated')
          .reduce((total, sb) => total + sb.size, 0);
        
        // Calculate block size based on allocated sub-blocks
        const blockSize = block.totalSize - allocatedSubBlocksSize;
        
        // Merge adjacent free blocks
        const mergedSubBlocks = [];
        let currentMerge = null;
        
        updatedSubBlocks.forEach((subBlock) => {
          if (subBlock.status === 'free') {
            if (!currentMerge) {
              currentMerge = { ...subBlock };
            } else {
              // Merge adjacent free blocks
              currentMerge.size += subBlock.size;
              currentMerge.id = `${currentMerge.id}-${subBlock.id}`;
            }
          } else {
            if (currentMerge) {
              mergedSubBlocks.push(currentMerge);
              currentMerge = null;
            }
            mergedSubBlocks.push(subBlock);
          }
        });
        
        // Add last merge if exists
        if (currentMerge) {
          mergedSubBlocks.push(currentMerge);
        }

        // If no allocated blocks, clear sub-blocks
        const finalSubBlocks = allocatedSubBlocksSize === 0 ? [] : mergedSubBlocks;
        
        return {
          ...block,
          size: blockSize,
          subBlocks: finalSubBlocks,
        };
      }
      return block;
    });

    // Update allocated blocks and memory pool
    setAllocatedBlocks(allocatedBlocks.filter((block) => block.id !== subBlockId));
    setMemoryPool(updatedMemoryPool);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial'  }}>
      <h1 style={{textAlign:'center'}}>Worst Fit Memory Allocator</h1>
      <h2 style={{textAlign:'center'}}>B.V.G.S.S.Gunawardhana | 221438175</h2>

      <div style={{textAlign:'center'}}>
        <h2>Allocate Memory</h2>
        <input
          type="number"
          value={allocationSize}
          onChange={(e) => setAllocationSize(e.target.value)}
          placeholder="Enter size to allocate"
        />
        <button onClick={allocateMemory}>Allocate</button>
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      </div>
        <div style={{display:'flex' , flexDerection:'row', justifyContent:'space-around'}}>

        <div>
        <h2>Memory Pool (Free Blocks)</h2>
        <ul>
          {memoryPool.map((block) => (
            <li key={block.id}>
              Block ID: {block.id}, Free Size: {block.size} bytes (Total: {block.totalSize})
              {block.subBlocks.length > 0 && (
                <ul>
                  {block.subBlocks.map((subBlock) => (
                    <li key={subBlock.id} style={{
                      color: subBlock.status === 'free' ? 'green' : 'red'
                    }}>
                      Sub Block ID: {subBlock.id}, 
                      Size: {subBlock.size} bytes, 
                      Status: {subBlock.status}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2>Allocated Blocks</h2>
        <ul>
          {allocatedBlocks.map((block) => (
            <li key={block.id}>
              Sub Block ID: {block.id}, Size: {block.size} bytes{' '}
              <button onClick={() => freeMemory(block.id)}>Free</button>
            </li>
          ))}
        </ul>
      </div>
        </div>
      </div>
  );
};

export default WorstFitAllocator;