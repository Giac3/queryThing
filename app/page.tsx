/* eslint-disable @next/next/no-img-element */
"use client"
import React, { ComponentType, FormEvent, Ref, RefAttributes, useRef, useState } from "react"
import * as zod from 'zod'

import Flow from "@/components/Flow";
import dynamic from "next/dynamic";
import "@uiw/react-textarea-code-editor/dist.css";
import { TextareaCodeEditorProps } from "@uiw/react-textarea-code-editor";
import Loader from "@/components/Loader";

const CodeEditor = dynamic(
  () => import("@uiw/react-textarea-code-editor").then((mod) => mod.default),
  { ssr: false }
);

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



export default function Home() {

  const [showConnect, setShowConnect] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)

  const [tableData, setTableData] = useState<Table[]>()

  const [user, setUser] = useState("")
  const [password, setPassword] = useState("")
  const [host, setHost] = useState("")
  const [port, setPort] = useState(5432)
  const [database, setDatabase] = useState("")
  const [connectionError, setConnectionError] = useState(false)

  const [code, setCode] = useState("")
  const [jsonData, setJsonData] = useState("")
  const [queryError, setQueryError] = useState(false)
  const generationMessageRef = useRef() as React.MutableRefObject<HTMLInputElement>
  const [isGenerating,setIsGenerating] = useState(false)
  const [isRunningQuery, setIsRunningQuery] = useState(false)

  const handleConnect = async (e:FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsConnecting(true)
    const form = (e.target as HTMLFormElement)
    const arr: HTMLInputElement[] = [].slice.call(form);

    let valUser:string, valPassword:string, valHost:string, valPort:number, valDatabase:string;



    arr.map((child:HTMLInputElement | HTMLButtonElement) => {
      switch(child.name){
        case "user":
          valUser = child.value
          break
        case "password":
          valPassword = child.value
          break
        case "host":
          valHost = child.value
          break
        case "port":
          valPort = parseInt(child.value)
          break
        case "database":
          valDatabase = child.value
          break
      }
    })

    setUser(valUser!)
    setPassword(valPassword!)
    setHost(valHost!)
    setPort(valPort!)
    setDatabase(valDatabase!)
    

    try {
      const connectRes = await fetch("https://evasive-bite-production.up.railway.app/pgConnect", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        user: valUser!,
        password: valPassword!,
        host: valHost!,
        port: valPort!,
        database: valDatabase!
      })
    })
    if (connectRes.status === 400) {
      throw "connection error"
    }
    if (connectRes.status === 200) {

      const data = await connectRes.json()
      
      setTableData(data.tables)
      setIsConnecting(false)
      setIsConnected(true)
      setShowConnect(false)
    }
    return
    } catch (error) {
      console.log(error)
      setIsConnecting(false)
      setConnectionError(true)
      setTimeout(() => {
        setConnectionError(false)
      }, (1500));
    }

  }

  const handleGenerateQuery = async () => {
    if (generationMessageRef.current.value !== "") {
      setIsGenerating(true)
      try {
        const queryRes = await fetch("https://evasive-bite-production.up.railway.app/generateQuery", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            tableData: tableData,
            message: generationMessageRef.current.value
          })
        })

        const data = await queryRes.json()
        
        setCode(data.query)
        setIsGenerating(false)
      } catch (error) {
        console.log(error)
        setIsGenerating(false)
        setQueryError(true)
        setTimeout(() => {
          setQueryError(false)
        }, 1000);
        
      }
    }
  }

  const handleRunQuery = async () => {
    if (code !== "") {
      try {
        setIsRunningQuery(true)
        const queryRes = await fetch("https://evasive-bite-production.up.railway.app/runQuery", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            connectionData: {
              user:user,
              password: password,
              host: host,
              port: port,
              database: database
            },
            query: code
          })
        })
        
        if (queryRes.status === 400) {
          throw "connection error"
        }
        const data = await queryRes.json()
        
        setJsonData(JSON.stringify(data.jsonData, null, "\t"))
        setIsRunningQuery(false)
      } catch (error) {
        console.log(error)
        setIsRunningQuery(false)
        setQueryError(true)
      }
    }
  }

  const handleRefresh = async () => {
    try {
      const connectRes = await fetch("https://evasive-bite-production.up.railway.app/pgConnect", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        user: user,
        password: password,
        host: host,
        port: port,
        database: database
      })
    })
    if (connectRes.status === 400) {
      throw "connection error"
    }
    if (connectRes.status === 200) {

      const data = await connectRes.json()
      setTableData(data.tables)
      setIsConnecting(false)
      setIsConnected(true)
      setShowConnect(false)
    }
    return
    } catch (error) {
      console.log(error)
      setIsConnecting(false)
      setConnectionError(true)
      setTimeout(() => {
        setConnectionError(false)
      }, (1500));
    }

  }

  return (
    <main className=" w-screen h-screen  bg-[#252521] flex">
      <div className="flex w-screen h-screen flex-col items-center justify-between pl-24 pr-24 lg:pl-2 lg:pr-2">
        <div className="w-full  flex justify-between items-center p-10 pb-0">
          <div className="flex items-center justify-center gap-1">
          <img className=" fill-white w-10 h-10 rounded-md" alt="queryThing logo" src="qthing.svg"/>
          <h1>queryThing</h1>
          
          </div>
        {
          isConnected ? <button onClick={handleRefresh} className="p-1 border-2 border-green-200 text-white rounded-md">Refresh Schema</button> : <button onClick={() => {setShowConnect(true)}} className="p-1 border-2 border-white text-white rounded-md">Connect Database</button>
        }
      </div>
      <div className="w-full h-1/2 p-10 pt-4 pb-2">
        <div className=" border-2 border-white rounded-md w-full h-full">
          <Flow tableData={tableData}/>
        </div>
      </div>
      <div className="w-full h-1/2 md:h-2/3 p-10 pt-2 min-h-1/2">
        <div className="border-2 p-4 gap-4 border-white rounded-md w-full h-full flex flex-row md:flex-col">
        <div className=" w-full h-full flex flex-col md:overflow-y-auto">
        <div onClick={() => {document.getElementById("editor")?.focus()}} className="border-2 border-white rounded-md w-full h-full bg-transparent p-1 outline-none code overflow-y-auto cursor-text">
                <CodeEditor
                id="editor"
                className="code h-full "
            value={code}
            language="sql"
            placeholder="Enter SQL"
            onChange={(evn) => setCode(evn.target.value)}
            padding={15}
            style={{
              fontSize: 15,
              fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
            }}
          />
          </div>
          <div className="w-full flex items-center justify-between h-10 pt-2 ">
          {
            isGenerating ? <div  className="rounded-md border-2 border-white p-1 w-7 flex items-center  justify-center"><Loader/></div> : <button disabled={!isConnected} onClick={handleGenerateQuery} className="rounded-md border-2 border-white p-1">Generate</button>
          }
          {
            isRunningQuery ? <div  className="rounded-md border-2 border-white p-1 w-7 flex items-center  justify-center"><Loader/></div> : <button onClick={handleRunQuery} disabled={!isConnected} className="rounded-md border-2 border-white p-1">Run</button>
          }
          
          </div>
          <div className="w-full flex items-center justify-between h-10 pt-2">
          <input ref={generationMessageRef} placeholder="Generate query" className="bg-white w-full rounded-md p-1 outline-none text-black"/>
          </div>
          </div>
          
          <div className="w-full h-full flex items-center justify-center relative md:overflow-y-auto">
          <div className="border-2 border-white rounded-md w-full h-full bg-transparent p-1 outline-none code overflow-y-auto">
            <CodeEditor
            readOnly
                  className="code h-full"
              value={jsonData}
              language="json"
              padding={15}
              style={{
                fontSize: 15,
                fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
                cursor: "none"
              }}
            />
          </div>
      <h1 className=" absolute right-0 top-0 rounded-md p-1 border-b-2 border-l-2 rounded-tl-none rounded-br-none border-white">Data</h1>
        </div>
        </div>
      </div>
      </div>
      {
        showConnect ? <div className="flex w-screen h-screen flex-col items-center justify-center absolute z-10 p-10 bg-gray-200 bg-opacity-40 ">
          
            {
              connectionError 
              ? 
              <div className="bg-[#252521]  p-4 rounded-md flex flex-col w-[300px] gap-2">
                <h1 className="bg-red-300 rounded-md p-2 flex text-center">There was a connection error, try again</h1>
              </div> 
              : isConnecting ? <div className="bg-[#252521]  p-4 rounded-md flex flex-col  ">
                <Loader/>
              </div> : <form onSubmit={e => handleConnect(e)} className="bg-[#252521]  p-4 rounded-md flex flex-col w-[300px] gap-2">
                
                <input placeholder="user" name="user" defaultValue={user} className="bg-white p-1 rounded-sm outline-none text-black" required/>
                <input placeholder="password" name="password" defaultValue={password} className="bg-white p-1 rounded-sm outline-none text-black" required/>
                <input placeholder="database" name="database" defaultValue={database} className="bg-white p-1 rounded-sm outline-none text-black" required/>
                <input placeholder="host" name="host" defaultValue={host} className="bg-white p-1 rounded-sm outline-none text-black" required/>
                <input placeholder="port" name="port" defaultValue={port} type="number" className="bg-white p-1 rounded-sm outline-none text-black" required/>
                <div className="flex flex-row gap-1 w-full items-center justify-center">
                  <button onClick={() => {setShowConnect(false)}} className="text-xs underline text-gray-600">cancel</button>
                <button className="bg-gray-500 rounded-md shadow-md hover:bg-gray-300 duration-100 hover:text-black p-1" type="submit">Connect</button>
                </div>
                <h2 className=" text-[8px] text-center w-full">currently supports hosted postgres databases</h2>
                </form>
            }
          
        </div> : null
      }
    </main>
  )
}
