"use client"
import { useCallback, useEffect, useState } from 'react';
import ReactFlow, { Controls, Edge, Node, ReactFlowProvider, applyEdgeChanges, applyNodeChanges } from 'reactflow';

import 'reactflow/dist/style.css';
import TableNode from './TableNode';

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

interface Table {
    table_name: string,
    columns: Column[]
  }

type Props = {
    tableData: Table[] | undefined
}
const nodeTypes = { tableNode: TableNode };
const proOptions = { hideAttribution: true };

function Flow ({tableData}:Props) {
    const [nodes, setNodes] = useState<Node<any, string | undefined>[]>()
    const [edges, setEdges] = useState<Edge[]>([])
    const [loadingSchema, setLoadingSchema] = useState(false)

    const onNodesChange = useCallback(
        (changes:any) => setNodes((nds) => applyNodeChanges(changes, (nds as Node<any>[]))),
        []
      );
      const onEdgesChange = useCallback(
        (changes:any) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        []
      );

    useEffect(() => {
        if (tableData && tableData.length > 0) {
            setLoadingSchema(true)
            let nodeTemp: Node<any, string | undefined>[]  = []
            let edgeTemp: Edge[]  = []
            tableData.map((table, i) => {
                nodeTemp.push({
                    id: table.table_name,
                    position: { x: i*800, y: 0 },
                    type: "tableNode",
                    data: {
                        columns: table.columns   
                    }
                })

                table.columns.map((column) => {
                    if (column.constraint_type === "FOREIGN KEY") {
                        edgeTemp.push(
                            { id: `${column.foreign_table_name}-${column.table_name}`, source: `${column.foreign_table_name}`, target: `${column.table_name}`, label:  `${column.table_name} referencing ${column.foreign_table_name}`}
                        )
                    }
                })
            })
            setNodes(nodeTemp)
            setEdges(edgeTemp)
            setLoadingSchema(false)
        }
    }, [tableData])

  return nodes && nodes.length ? (
    <ReactFlowProvider>
      <ReactFlow 
      fitView={true}
      minZoom={0.1}
      defaultViewport={{ x: 0, y: 0, zoom: 0.1 }}
      nodes={nodes!} 
      edges={edges} 
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      proOptions={proOptions}
      nodeTypes={nodeTypes} />
      
      </ReactFlowProvider>
  ) : <div className='w-full h-full flex items-center justify-center flex-col gap-2'><h1 className='p-2 flex items-center justify-center rounded-md border-2 border-white'>Schema Visualiser</h1> <h2 className='text-xs'>Connect your database</h2></div>;
}

export default Flow;