import React from 'react'
import PropTypes from 'prop-types'
import { isIphoneX } from 'react-native-iphone-x-helper'
import {
    BackHandler,
    LayoutAnimation,
    Platform,
    UIManager,
    View
} from 'react-native'

const ANIMATION_DURATION = 250

// Enable LayoutAnimation on Android
if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

export const INPUT_METHOD = {
    NONE: 'NONE',
    KEYBOARD: 'KEYBOARD',
    CUSTOM: 'CUSTOM',
}

export default class MessagingContainer extends React.Component {
    static propTypes = {
        // From 'KeyboardState'
        containerHeight: PropTypes.number.isRequired,
        contentHeight: PropTypes.number.isRequired,
        keyboardHeight: PropTypes.number.isRequired,
        keyboardVisible: PropTypes.bool.isRequired,
        keyboardWillShow: PropTypes.bool.isRequired,
        keyboardWillHide: PropTypes.bool.isRequired,

        // Managing the IME type
        inputMethod: PropTypes.oneOf(Object.values(INPUT_METHOD))
            .isRequired,
        onChangeInputMethod: PropTypes.func,

        // Rendering content
        children: PropTypes.node,
        renderInputMethodEditor: PropTypes.func.isRequired,
    }

    static defaultProps = {
        children: null,
        onChangeInputMethod: () => { },
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        // console.log(nextProps)
        const { onChangeInputMethod } = this.props

        if (!this.props.keyboardVisible && nextProps.keyboardVisible) {
            // Keyboard shown
            onChangeInputMethod(INPUT_METHOD.KEYBOARD)
        } else if (
            this.props.keyboardVisible &&
            !nextProps.keyboardVisible &&
            this.props.inputMethod !== INPUT_METHOD.CUSTOM
        ) {
            // Keyboard hidden
            onChangeInputMethod(INPUT_METHOD.NONE)
        }

        // Create the animation
        const animation = LayoutAnimation.create(
            ANIMATION_DURATION,
            Platform.OS === 'android'
                ? LayoutAnimation.Types.easeIn
                : LayoutAnimation.Types.keyboard, // Not available on android
            LayoutAnimation.Properties.opacity,
        )

        LayoutAnimation.configureNext(animation)
    }

    componentDidMount() {
        this.subscription = BackHandler.addEventListener(
            'hardwareBackPress',
            () => {
                const { onChangeInputMethod, inputMethod } = this.props

                if (inputMethod === INPUT_METHOD.CUSTOM) {
                    onChangeInputMethod(INPUT_METHOD.NONE)
                    return true
                }

                return false
            }
        )
    }

    componentWillUnmount() {
        this.subscription.remove()
    }

    render() {
        const {
            children,
            renderInputMethodEditor,
            inputMethod,
            containerHeight,
            contentHeight,
            keyboardHeight,
            keyboardWillShow,
            keyboardWillHide,
        } = this.props

        /*
            For our outer 'View', we want to choose between rendering at
            full height ('containerHeight') or only the height avobe the
            keyboard ('contentHeight'). If the keyboard is currently
            appearing ('keyboardWillShow' is true) or if it's fully
            visible ('inputMethod === INPUT_METHOD.KEYBOARD'), we should use
            'contentHeight'
        */
        const useContentHeight =
            keyboardWillShow || inputMethod === INPUT_METHOD.KEYBOARD

        const containerStyle = {
            height: useContentHeight ? contentHeight : containerHeight
        }

        /* 
            We want to render our custom input when the user has pressed
            the camera button ('inputMethod === INPUT_METHOD.CUSTOM'), so long
            as the keyboard isn't currently appearing (which would means the input
            field has received focus, but we haven't updated the 'inputMethod' yet)
        */
        const showCustomInput =
            inputMethod === INPUT_METHOD.CUSTOM && !keyboardWillShow

        /* 
            If 'keyboardHeight' is 0, this means a hardware keyboard is connected
            to the device. We still want to show our custom image picker when a
            hardware keyboard is connected, so let's set 'keyboardHeight' to 250
            in this case.
        */

        // The keyboard is hidden and not transitioning up
        const keyboardIsHidden =
            inputMethod === INPUT_METHOD.NONE && !keyboardWillShow

        // The keyboard is visible and transitioning down

        const keyboardIsHiding =
            inputMethod === INPUT_METHOD.KEYBOARD && keyboardWillHide

        const inputStyle = {
            height: showCustomInput ? keyboardHeight || 250 : 0,

            // Show extra space if the device is an iPhone X and the keyboard is not visible
            marginTop:
                isIphoneX() && (keyboardIsHidden || keyboardIsHiding)
                    ? 24
                    : 0
        }

        return (
            <View style={containerStyle}>
                {children}
                <View style={inputStyle}>{renderInputMethodEditor()}</View>
            </View>
        )
    }
}