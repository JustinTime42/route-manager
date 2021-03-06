import React from 'react'
import { Button } from 'react-bootstrap'
import { useSelector } from 'react-redux'

const PropertyCard = (props) => {

    const routeData = useSelector(state => state.getRouteData.routeData)

    const status = props.address.status

    const cardBg = () => {        
        if (props.address.inactive) return `rgba(255,0,0,0.5)`
        else if (props.address.temp) return `rgba(255,110,0,0.5)`
        else if ((props.address?.contract_type === 'Seasonal' || props.address?.contract_type === 'Monthly') && (status === "Waiting")) return `rgba(255,255,0,0.5)`
        else return null
    }
    const cardStyle = {
        margin: '3px',
        padding: '7px',
        borderRadius: "10px",
        border: props.address?.key === props.activeProperty?.key ? "7px solid rgb(55,90,127)" : "none",
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
        borderRadius: "10px",
        backgroundColor: status === "Waiting" ? `rgba(255,200,0,0.9)` : 
            status === "Skipped" ? `rgba(255,0,0,0.7)` :
            status === "Done" ? `rgba(0,255,0,0.7)` : null
    }

    const editStyle = {
        verticalAlign: "bottom"
    }

    const RouteString = () => {
        let routes = 'Routes Assigned: '
        routeData.forEach((entry, i) => {                                        
            if (entry.property_key === props.address?.key) {
                routes += `${entry.route_name}, `                   
            }            
        })
        return <p>{routes}</p>
    }

    return(
        <div id={`card${(typeof(props.i) === 'number') ? props.i : props.address.key}`} style={cardStyle} onClick={() => props.handleClick(props.address)}>
            <div style={rightStyle}>                
                {(typeof(props.address.route_position) === "number") ?                     
                    <p style={{...statusStyle}}>
                        {status}                        
                    </p>         
                    : <p></p>
                } 
                {props.admin === true ? 
                    <p style={editStyle}><Button variant="secondary" onClick={() => props.detailsClick(props.address)}>Details</Button></p>  : <p></p>               
                }
            </div>
            <h5 style={{textAlign: "left", fontWeight: "bold"}}>  
            {typeof(props.i) === 'number'  ? props.i + 1 + '. ' : ''}{props.address ? props.address.cust_name ? props.address.cust_name : "name" : "name"}{props.address ? props.address.is_new ? "*" : null : null}            
            </h5> 
            <p style={{color: "rgba(255, 255, 255, 0.7)"}}>{props.address ? props.address.address ? props.address.address : "address" : "address"} </p> 
            <RouteString />              
        </div>
    )
}   

export default PropertyCard