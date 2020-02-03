import React from 'react'
import PropTypes from 'prop-types'
import { Keyboard, Platform } from 'react-native'

export default class KeyboardState extends React.Component {
    static propTypes = {
        layout: PropTypes.shape({
            x: PropTypes.number.isRequired,
            y: PropTypes.number.isRequired,
            height: PropTypes.number.isRequired,
            width: PropTypes.number.isRequired,
        }).isRequired,
        children: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props)

        const { layout: { height } } = props

        this.state = {
            contentHeight: height,
            keyboardHeight: 0,
            keyboardVisible: false,
            keyboardWillShow: false, // only relevant on IOS
            keyboardWillHide: false, // only relevant on IOS
        }
    }

    UNSAFE_componentWillMount() {
        if (Platform.OS === 'IOS') {
            this.subscriptions = [
                Keyboard.addListener('keyboardWillHide', this.keyboardWillHide),
                Keyboard.addListener('keyboardWillShow', this.keyboardWillShow),
                Keyboard.addListener('keyboardDidHide', this.keyboardDidHide),
                Keyboard.addListener('keyboardDidShow', this.keyboardDidShow),
            ]
        } else {
            this.subscriptions = [
                Keyboard.addListener('keyboardDidHide', this.keyboardDidHide),
                Keyboard.addListener('keyboardDidShow', this.keyboardDidShow),
            ]
        }
    }

    componentWillUnmount() {
        this.subscriptions.forEach(subscription => subscription.remove())
    }

    keyboardWillShow = (event) => {
        this.setState({ keyboardWillShow: true })
        this.measure(event)
    }

    keyboardDidShow = (event) => {
        this.setState({
            keyboardWillShow: false,
            keyboardVisible: true
        })
        this.measure(event)
    }

    keyboardWillHide = (event) => {
        this.setState({ keyboardWillHide: true })
        this.measure(event)
    }

    keyboardDidHide = () => {
        this.setState({
            keyboardWillHide: false,
            keyboardVisible: false
        })
    }

    measure = (event) => {
        const { layout } = this.props

        console.log(Object.entries(event))

        const {
            endCoordinates: { height, screenY },
        } = event

        this.setState({
            contentHeight: screenY - layout.y,
            keyboardHeight: height,
        })
    }

    render() {
        const { children, layout } = this.props
        const {
            contentHeight,
            keyboardHeight,
            keyboardVisible,
            keyboardWillShow,
            keyboardWillHide,
        } = this.state

        return children({
            containerHeight: layout.height,
            contentHeight,
            keyboardHeight,
            keyboardVisible,
            keyboardWillShow,
            keyboardWillHide,
        })
    }
}

