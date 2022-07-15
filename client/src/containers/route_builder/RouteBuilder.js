/*
drag and drop
if source === dest & dest === route
    reorder route
else 
if dest === rightSide
    remove from route
else 
    add to route
    set status waiting


maintain two lists: 
    routeProperties
        all the properties currently on the route
        this updates live - sends to server during onDrop
    otherProperties
        all properties except the current route properties

For state management, we'll use local state synced with firestore subscription like the dropdowns
*/


import React, {useState, useEffect} from 'react'
import { useDispatch, useSelector } from "react-redux";
import * as styles from './route-builder-styles'
import * as dnd from './drag-functions'
import { collection, query, onSnapshot } from "firebase/firestore";
import Button from 'react-bootstrap/Button'
import { db } from '../../firebase' 
import {UPDATE_ADDRESSES_SUCCESS, GET_ROUTE_SUCCESS, REQUEST_ROUTES_SUCCESS, SET_ACTIVE_ROUTE, SET_ACTIVE_PROPERTY} from '../../constants'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import PropertyCard from "../../components/PropertyCard"
import CustomerEditor from '../../components/editor_panels/CustomerEditor'
import { editItem, requestAllAddresses, filterRouteProperties, saveRoute, setActiveProperty, saveNewProperty, editProperty, deleteProperty, getRouteData, createItem, setTempItem, setActiveRoute, showModal, hideModal } from "../../actions"


const RouteBuilder = () => {
    const modals = useSelector(state => state.whichModals.modals)
    const activeRoute = useSelector(state => state.setActiveRoute.activeRoute)
    const activeCustomer = useSelector(state => state.setActiveProperty.activeProperty)
    const allCustomers = useSelector(state => state.requestAllAddresses.addresses)
    const searchResults = useSelector(state => state.filterProperties.customers)
    // const routeProperties = useSelector(state => state.getRouteProperties.addresses)
    const routeData = useSelector(state => state.getRouteData.routeData)
    const dispatch = useDispatch()

    const [onRouteList, setOnRouteList] = useState([])
    const [offRouteList, setOffRouteList] = useState([])
    //const [allCustomers, setAllCustomers] = useState([])
    const [scrollPosition, setScrollPosition] = useState(0)
    const [searchField, setSearchField] = useState('')
    
    // Get all the customer data
    useEffect(() => {
        const unsub = onSnapshot(collection(db, `admin/admin_lists/customer`), (querySnapshot) => {
            dispatch({type: UPDATE_ADDRESSES_SUCCESS, payload: querySnapshot.docs.map((doc) => ({...doc.data(), id: doc.id}))})
        })
        return () => {
            unsub()
        }
    },[])

    // Get the active route's name, property keys, route order, etc. 
    useEffect(() => {
        const unsub = onSnapshot(collection(db, `driver/driver_lists/route`), (querySnapshot) => {
            let routeData = querySnapshot.docs.map((doc) => ({...doc.data(), id: doc.id}))   //  dispatch(setActiveRoute(querySnapshot.docs.map((doc) => ({...doc.data(), id: doc.id}))))  
            let onRouteList = []
            routeData.customers.forEach(customer => {
                let details = allCustomers[allCustomers.findIndex(i => i.id === customer.id)]
                onRouteList.push({...details, ...customer})
            })
            setOnRouteList(onRouteList.sort((a, b) => a.route_position > b.route_position ? 1 : -1))
        })
        return () => {
            unsub()
        }
    },[])

    // Get the results  (right side list)
    // Should be customers that match the search field except those that already are in the left column. 
    // if search results.length < 1, search left column and scroll to first result
    const filterSearchResults = () => {
        setOffRouteList(searchResults.filter(item => !item.nonAdminFields.routes_assigned.includes(routeData.name)))         
    }

    // Merge the data from the route with the customer data for presentation and sorting. 
    // gonna try doing this within the above useEffect
    // const setRouteProperties = () => {
    //     let onRouteList = []
    //     activeRoute.customers.forEach(customer => {
    //         let details = allCustomers[allCustomers.findIndex(i => i.id === customer.id)]
    //         onRouteList.push({...details, ...customer})
    //     })
    //     setOnRouteList(onRouteList.sort((a, b) => a.route_position > b.route_position ? 1 : -1)) 
    // }



    const onInitRoute = () => {
        dispatch(editItem(onRouteList.map(i => i.status = "Waiting"), [], 'route_data', SET_ACTIVE_ROUTE, REQUEST_ROUTES_SUCCESS))
    }

    const handlePropertyClick = (property) => {
        setScrollPosition({scrollPosition: document.getElementById('droppable2scroll').scrollTop}, () => {
            dispatch(setActiveProperty(property)) 
        })        
    }

    const onNewPropertyClick = () => {
        //this.setState({scrollPosition: document.getElementById('droppable2scroll').scrollTop})
        dispatch(setTempItem({nonAdminFields: {}, adminFields: {}}))
        dispatch(showModal("Customer"))             
    }

    const onDetailsPropertyClick = (property) => {
        this.props.showModal('Customer')
        dispatch(setTempItem(property)) 
    }

    const onCloseClick = () => {
        dispatch(hideModal('Customer'))
    }

    const onDragEnd = (result) => {
        const newLists = dnd.onDragEnd(result, onRouteList, offRouteList, activeRoute)
        dispatch(editItem(newLists.onRouteList, null, 'driver/driver_lists/route/', null, null))
    }

    const onPropertySave = (newDetails) => {
        console.log(newDetails)
        if(!newDetails.contract_type) {
            newDetails.contract_type = "Per Occurrence"
        }
        let {route_name, route_position, status, active, ...details} = newDetails
        if (newDetails.id) {
            dispatch(editItem((details, allCustomers, 'admin/admin_lists/customer', SET_ACTIVE_PROPERTY, UPDATE_ADDRESSES_SUCCESS)))
        } else {
            dispatch(createItem((details, allCustomers, 'admin/admin_lists/customer', SET_ACTIVE_PROPERTY, UPDATE_ADDRESSES_SUCCESS)))            
        }
        this.setState({showModal: false, scrollPosition: document.getElementById('droppable2scroll').scrollTop})
        this.setSelected()
    }

    const onDelete = () => {
        return
        // if it's on a route already, we need to remove it from the route
        // if (activeCustomer.nonAdminFields.routes_assigned.includes(routeData.name)) {

        // }
        // // then delete the property

        // if (this.props.activeProperty.route_name === this.props.activeRoute) {
        //     this.props.onDeleteProperty(this.props.activeProperty, this.props.addresses, this.props.routeData, this.props.activeRoute)
        // } else {
        //     this.props.onDeleteProperty(this.props.activeProperty, this.props.addresses, this.props.routeData)
        // }      
        // this.props.onSetActiveProperty(null)
    }

    /*
    Things removed from DragEnd
    onSave - maybe can be caught with a useEffect or can be re-added to onDragEnd by sending to db there
    checking if customer is already on route (should be unnecessary)
    setStates changed to return statements. will need to setState here, so I'll need to add some functionality here
    The right hand list just needs to be the customers that are returned by the searchfield and aren't on the route
    if the right hand list.length() === 0, search the left side and scroll to results

    new shape of routeData stored in firebase should be:

    so I could store the route_data like in heroku, then subscribe to the query: 
        I need a way to identify the properties in the route. 
    routeData: [{
        customer_id:
        routeName:
        route_position:
        Priority:
        active:
        status:        
    }]
    then we can subscribe to the query arrayContains(routeName:)

    Each customer can have an array: routes_assigned, and I can subscribe to the query customers where
    routes_assigned array-contains, 'routeName'
    We'd still need a route_data collection exactly like in postgress to store the rest of the relevant route data 
    and then merge that data into the customer data just like now
    actually maybe there should be a collection of routes - hey there already is!
    a document would look like this: 
    routeName: [

        or
        customer_id: {
            routeName:
            route_position:
            Priority:
            active:
            status:
        }
    ]

    or, in addition to the routes_assigned field, I could also have a an array of maps within the customer document. 
    Nope. separate document for the route makes more sense. If the route_data is stored in the customer document, then
    when a route gets re-ordered, we'll have to do a write on every customer document on that route, rather than 
    just on the route_data document

    /driver/driver_lists/route/[routeID] will be of the shape: 
    name:
    active: 
    customers: [
        {        
            customer_id:
            cust_name:
            service_address:
            routes_assigned:
            contract_type
            service_level
            route_position:
            Priority:
            active:
            status:
        },
    ]
    this will cap routes at 180 customers per route, but that should be plenty and will greatly reduce writes

    then, when driver hits done, it writes to this document and do the service log
    */ 
 
    return (
        false ? //check for loading or incomplete conditions here
        <h1></h1> :(
        <>
        <div style={{display: "flex", justifyContent: "space-around", margin: "3px"}}>
            {/* <Button variant="primary" size="sm" style={{margin: "3px"}} onClick={this.refreshData}>Refresh Data</Button> */}
            <Button variant="primary" size="sm" style={{margin: "3px"}} onClick={onInitRoute}>Initialize Route</Button>
            <Button variant="primary" size="sm" onClick={onNewPropertyClick}>New</Button>
        </div>
        <div className="adminGridContainer">
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="droppable1">                    
                {(provided, snapshot) => (
                    <div
                        className="leftSide, scrollable"
                        id="droppable1scroll"
                        ref={provided.innerRef}
                        style={styles.getListStyle(snapshot.isDraggingOver)}>
                        {onRouteList.map((item, index) => (
                            <Draggable
                                key={item.id}
                                draggableId={`L${item.id.toString()}`}
                                index={index}>
                                {(provided, snapshot) => (
                                    <div
                                        id={`${item.id}routecard`}
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        style={styles.getItemStyle(
                                            snapshot.isDragging,
                                            provided.draggableProps.style
                                        )}>
                                        <PropertyCard 
                                            i={index} 
                                            route={activeRoute}
                                            key={item.key} 
                                            address={item} 
                                            admin={true} 
                                            detailsClick={onDetailsPropertyClick}
                                            handleClick={handlePropertyClick}
                                            activeProperty={activeCustomer}
                                        />
                                    </div>
                                )}
                            </Draggable>
                        ))
                        }
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
            <Droppable className="rightSide" droppableId="droppable2">
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        className="rightSide, scrollable"
                        style={styles.getListStyle(snapshot.isDraggingOver)}>
                        {offRouteList.map((item, index) => (
                            <Draggable
                                key={item.key}
                                draggableId={`R${item.key.toString()}`}
                                index={index}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        style={styles.getItemStyle(
                                            snapshot.isDragging,
                                            provided.draggableProps.style
                                        )}>
                                        <PropertyCard 
                                            route={activeRoute} 
                                            key={item.key} 
                                            address={item} 
                                            admin={true} 
                                            detailsClick={onDetailsPropertyClick} 
                                            handleClick={handlePropertyClick}
                                            activeProperty={activeCustomer}
                                        />
                                            
                                    </div>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
            <CustomerEditor 
                activeProperty={activeCustomer} 
                onSave={onPropertySave}
                show={showModal}
                close={onCloseClick}
                onDelete={onDelete}
            />
        </div>
        </>  
   ))    
}

export default RouteBuilder