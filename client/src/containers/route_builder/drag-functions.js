const move = (source, destination, droppableSource, droppableDestination) => {
    const sourceClone = Array.from(source)
    const destClone = Array.from(destination)
    const [removed] = sourceClone.splice(droppableSource.index, 1)
    destClone.splice(droppableDestination.index, 0, removed)
    const result = {}
    result[droppableSource.droppableId] = sourceClone
    result[droppableDestination.droppableId] = destClone
    return result
}

const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list)
    const [removed] = result.splice(startIndex, 1)
    result.splice(endIndex, 0, removed)
    return result
}

export const onDragEnd = (result, onRouteList, offRouteList, activeRoute) => {

    const id2List = {
        droppable1: onRouteList,
        droppable2: offRouteList,
    }
    const { source, destination } = result
    const getList = id => this.state[this.id2List[id]]
    const newList = move(
        getList(source.droppableId),
        getList(destination.droppableId),
        source,
        destination
    )

    if (!destination) {
        return;
    }

    // const getRoutePosition = (item) => {
    //     routePosition = activeRoute.customers[activeRoute.customers.findIndex(i => i.route_name === activeRoute)].route_position
    //     return item.nonAdminFields.routes_assigned
    // }

    //If only reordering route
    if (source.droppableId === destination.droppableId) {
        if (source.droppableId === 'droppable1') {
            const orderedItems = reorder(
                getList(source.droppableId),
                source.index,
                destination.index
            )
            orderedItems.forEach((item, i) => {
                item.route_position = i
            })
            return {onRouteList: orderedItems, scrollPosition: document.getElementById('droppable1scroll').scrollTop, offRouteList: offRouteList}
        }   
    } else {   //if  moving from one list to another
        newList.droppable1.forEach((item, i) => item.route_position = i)
        if ((destination.droppableId === "droppable1")) { //If adding to route
            let droppedCard = newList.droppable1.find(item => item.id === parseInt(result.draggableId.slice(1))) 
            droppedCard.status="Waiting"
                return {onRouteList: newList.droppable1, scrollPosition: document.getElementById('droppable1scroll').scrollTop, offRouteList: newList.droppable2}
        }      
        else if (destination.droppableId === "droppable2") {  // removing from route 
            return {selected: newList.droppable1, scrollPosition: document.getElementById('droppable1scroll').scrollTop, offRouteList: newList.droppable2}
           }
    }        
}

