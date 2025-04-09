import React from 'react'

const CarPage = async ({params}:any) => {
    const id = await params
  return (
    <div>
      carpage : {id}
    </div>
  )
}

export default CarPage
