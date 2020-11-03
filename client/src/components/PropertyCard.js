import React from 'react'
import { Button } from 'react-bootstrap'

const PropertyCard = (props) => {

    const status = props.address.route_data.some(item => item.route_name === props.route) ?
        props.address.route_data.find(item => item.route_name === props.route).status : null
    
    const route_list = props.address.route_data.map(item => item.route_name + ", ")

    const cardBg = () => {
        if (props.address.inactive === true) return `rgba(231,76,60,0.7)`  
        else if (props.address.temp) return `rgba(235,185,5,0.7)`
        else if (props.activeProperty && props.activeProperty.key === props.address.key) return '#4E8098'
        else return null
    }
    const cardStyle = {
        margin: '3px',
        padding: '3px',
        width: props.width,
        backgroundColor: cardBg(), 
    }
    const rightStyle = {
        float: "right", 
        textAlign: "center",
        width: "90px",               
    }

    const statusStyle = {
        padding: "10px",
        //border: "2px, solid, black",
        borderRadius: "10px",
        backgroundColor: status === "Waiting" ? `rgba(255,200,0,0.9)` : 
            status === "Skipped" ? `rgba(255,0,0,0.7)` :
            status === "Done" ? `rgba(0,255,0,0.7)` : null
    }

    const seasonalStyle = {
        border: props.address ? props.address.contract_type === 'Seasonal' || props.address.contract_type === 'monthly' ? "10px solid #375A7F" : "none" : "none"   
    }

    const editStyle = {
        verticalAlign: "bottom"
    }

    return(
        <div id={`card${(typeof(props.i) === 'number') ? props.i : props.address.key}`} style={cardStyle} onClick={() => props.handleClick(props.address)}>
            <div style={rightStyle}>                
                {props.address ? 
                    <p style={{...statusStyle, ...seasonalStyle}}>{status}</p> : <p style={statusStyle}></p>             
                } 
                {props.admin === true ? 
                    <p style={editStyle}><Button variant="secondary" onClick={() => props.editClick(props.address)}>Edit </Button></p>  : <p></p>               
                }
            </div>
            <h5 style={{textAlign: "left", width: "100%", fontWeight: "bold"}}>  
            {typeof(props.i) === 'number'  ? props.i + 1 + '. ' : ''}{props.address ? props.address.cust_name ? props.address.cust_name : "name" : "name"}{props.address ? props.address.is_new ? "*" : null : null}            
            </h5>                             
            <p style={{color: "rgba(255, 255, 255, 0.7)"}}>{props.address ? props.address.address ? props.address.address : "address" : "address"} </p>            
            {props.admin ? <p>route: {route_list}</p> : <div></div>}
        </div>
    )
}   

export default PropertyCard