import React, { Component } from 'react'
import { Button, Modal, Form, Row, Col } from 'react-bootstrap'
import { connect } from 'react-redux'
import axios from "axios"
import { requestAllAddresses } from '../actions'

const mapStateToProps = state => {
    return {         
        activeProperty: state.setActiveProperty.activeProperty,
    }
}

const mapDispatchToProps = (dispatch) => {
    return {    
        onGetAllAddresses: () => dispatch(requestAllAddresses()),
    }
}

class NewProperty extends Component {
    constructor(props){ 
        super(props)
        this.state = {
            checked: this.props.activeProperty.is_new,
            activeProperty: {...this.props.activeProperty},
            api: this.props.activeProperty ? "editproperty" : "newproperty"
        }
    }

    componentDidUpdate(prevProps) {
        if(prevProps.activeProperty !== this.props.activeProperty){
          this.setState({ activeProperty: {...this.props.activeProperty}, api: this.props.activeProperty ? "editproperty" : "newproperty" })
        }
      }

    onSubmit = () => {
        console.log(this.state)
        axios.post(`https://snowline-route-manager.herokuapp.com/api/${this.state.api}`, 
            {
                ...this.state
            }
        )
        .then(res => {
            this.props.onGetAllAddresses() 
            console.log("updated address: " + res.key)
        })
        .catch(err => console.log(err)) 
    }

    onChange = (event) => {
        const name = event.target.name
        const value = event.target.value
        const checked = event.target.checked
        const property = this.state.activeProperty
        if (name === "is_new") {
            property.is_new = !property.is_new  
            this.setState(({                       
                checked: !this.state.checked
            }))
        }
        else {
            this.setState({
                [`activeProperty.${name}`]: value
            })
        }
        console.log(this.state.checked)
    }

    render() {
        return (
            <Modal show={this.props.show} onHide={this.handleClose}>
                    <Modal.Header>New Property</Modal.Header>
                    <Modal.Body>
                        <Form>
                            <Form.Group as={Row}>
                                <Form.Label column sm={2}>Address</Form.Label>
                                <Col sm={10}>
                                    <Form.Control name="address" type="text" placeholder={this.state.activeProperty.address || "address"} onChange={this.onChange}/>
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row}>
                                <Form.Label column sm={2}>Name</Form.Label>
                                <Col sm={10}>
                                    <Form.Control name="cust_name" type="text" placeholder={this.state.activeProperty.cust_name || "name"} onChange={this.onChange}/>
                                </Col>
                            </Form.Group>
                            <Form.Group as={Row}>
                                <Form.Label column sm={2}>Phone</Form.Label>
                                <Col sm={10}>
                                    <Form.Control name="cust_phone" type="text" placeholder={this.state.activeProperty.cust_phone || "phone"} onChange={this.onChange}/>
                                </Col>
                            </Form.Group>
                            <Row>
                                <Col>
                                    <Form.Group as={Row}>
                                        <Form.Label>Surface Type</Form.Label>
                                        <Form.Control name="surface_type" as="select" onChange={this.onChange}>
                                            <option value="select">Select</option>
                                            <option value="paved">Paved</option>
                                            <option value="gravel">Gravel</option>
                                            <option value="partial">Partial</option>
                                        </Form.Control>
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Check 
                                        name="is_new"
                                        type="checkbox"
                                        label="New Property?"
                                        checked = {this.state.checked}
                                        onChange={this.onChange}
                                    />
                                </Col>
                            </Row>
                            <Form.Group>
                                <Form.Label>Notes</Form.Label>
                                    <Form.Control name="notes" type="textarea" rows="3" placeholder="notes" onChange={this.onChange}/>
                            </Form.Group>
                        </Form> 
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="primary" onClick={this.onSubmit}>Save Changes</Button>
                        <Button variant="secondary" onClick={this.props.close}>Close</Button>
                    </Modal.Footer>
                </Modal>
        )
    }
}

// Now new property doesn't properly clear fields... 
// new property and edit property does property write to database
// need to update code to default populate with activeProperty fields. is_new does work now though for default
// this seems to be getting really bad spagghetti code, ponder


export default connect(mapStateToProps, mapDispatchToProps)(NewProperty)