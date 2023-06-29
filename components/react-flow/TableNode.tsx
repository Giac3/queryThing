import React, { useEffect } from 'react'
import { Handle, Position } from 'reactflow';

interface Column {
    table_name:string
    column_name: string
    foreign_table_name: string
    foreign_column_name: string
    data_type: string
    column_default:string
    is_nullable: string
    constraint_type: string
}

type Props = {
    data: {
        columns: Column[]
    }
}

const TableNode = ({data}:Props) => {

  return (
    
    <div className='w-full rounded-md border-white border-2 text-black'>
      
      <h1 className='text-white w-full border-b-2 border-white p-2'>{data.columns[0].table_name}</h1>
      <div className=' flex flex-row p-2 gap-2'>
        {
            Object.keys(data.columns[0]).map((column,i) => {
                if (column !== "table_name") {
                    return <div key={i} className=' text-xs p-1 rounded-md border-2 bg-white text-black border-white text-center w-20 h-16 flex items-center justify-center'>{column.replaceAll("_", " ")}</div>
                }
                
            })
        }
      </div>
      
        {
            data.columns.map((column, i) => {
                return <div key={i} className=' flex flex-row p-2 gap-2'>{
                    
                    Object.keys(data.columns[0]).map((columnHeader,j) => {
                        if (columnHeader !== "table_name") {
                            return <div key={j} className=' text-xs p-1 rounded-md border-2 text-white border-white text-center w-20 h-16 flex items-center justify-center overflow-auto'><h1 className='w-full'>{(column as { [keys:string]: any})[columnHeader]}</h1> 
                            <Handle type="source" position={Position.Right} id={column.table_name} />
                            <Handle type="target" position={Position.Left} id={column.table_name} />
                            </div>
                        }
                        
                    })
                }
                
                </div>
            })
        }
      
    </div>
  )
}

export default TableNode
