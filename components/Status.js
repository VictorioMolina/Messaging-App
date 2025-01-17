import React from 'react'
import { Constants } from 'expo'
import NetInfo from '@react-native-community/netinfo'
import {
    StyleSheet,
    Platform,
    StatusBar,
    Text,
    View,
} from 'react-native'

export default class Status extends React.Component {
    state = {
        isConnected: true,
    }

    async UNSAFE_componentWillMount() {
        NetInfo.addEventListener(
            this.handleChange,
        )

        const isConnected = (await NetInfo.fetch()).isConnected

        this.setState({ isConnected })

        // Testing Functionality Without Change To Air-Plane Mode
        // setTimeout(() => this.handleChange(false), 3000)
    }

    handleChange = (isConnected) => {
        this.setState({ isConnected })
    }

    render() {
        const { isConnected } = this.state

        const backgroundColor = isConnected ? 'white' : 'red'

        const statusBar = (
            <StatusBar
                backgroundColor={backgroundColor}
                barStyle={isConnected ? 'dark-content' : 'light-content'}
                animated={false}
            />
        )

        const messageContainer = (
            <View style={styles.messageContainer} pointerEvents="none">
                {statusBar}
                {!isConnected && (
                    <View style={styles.bubble}>
                        <Text style={styles.text}>No network connection</Text>
                    </View>
                )}
            </View>
        )

        if (Platform.OS === 'ios') {
            /* We return a view that simulates the StatusBar style on IOS */
            return (
                <View style={[styles.status, { backgroundColor }]}>
                    {messageContainer}
                </View>
            )
        }

        return messageContainer
    }
}

const statusHeight =
    (Platform.OS === 'ios' ? Constants.statusBarHeight : 0)

const styles = StyleSheet.create({
    status: {
        zIndex: 1,
        height: statusHeight,
    },
    messageContainer: {
        zIndex: 1,
        position: 'absolute',
        top: statusHeight + 20,
        right: 0,
        left: 0,
        height: 80,
        alignItems: 'center',
    },
    bubble: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: 'red'
    },
    text: {
        color: 'white'
    }
})
