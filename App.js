import React from 'react'
import {
  Alert,
  Image,
  TouchableHighlight,
  BackHandler,
  View,
  StyleSheet
} from 'react-native'

import Status from './components/Status'
import MessageList from './components/MessageList'
import Toolbar from './components/Toolbar'
import ImageGrid from './components/ImageGrid'
import KeyboardState from './components/KeyboardState'
import MeasureLayout from './components/MeasureLayout'
import MessagingContainer, {
  INPUT_METHOD
} from './components/MessagingContainer'
import {
  createTextMessage,
  createImageMessage,
  createLocationMessage,
} from './utils/MessageUtils'

export default class App extends React.Component {
  state = {
    messages: [],
    fullscreenImageId: null,
    isInputFocused: false,
    inputMethod: INPUT_METHOD.NONE,
  }

  UNSAFE_componentWillMount() {
    this.subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        const { fullscreenImageId } = this.state

        if (fullscreenImageId) {
          this.dismissFullscreenImage()
          return true // We have handled the back button
        }

        // We didn't handle the back button, so exit to the home screen 
        return false
      }
    )
  }

  componentWillUnmount() {
    this.subscription.remove()
  }

  dismissFullscreenImage = () => {
    this.setState({ fullscreenImageId: null })
  }

  renderFullscreenImage = () => {
    const { messages, fullscreenImageId } = this.state

    if (!fullscreenImageId) return null

    const image = messages.find(
      message => message.id === fullscreenImageId
    )

    if (!image) return null

    const { uri } = image

    return (
      <TouchableHighlight
        style={styles.fullscreenOverlay}
        onPress={this.dismissFullscreenImage}
      >
        <Image style={styles.fullscreenImage} source={{ uri }} />
      </TouchableHighlight>
    )
  }

  handleChangeInputMethod = (inputMethod) => {
    this.setState({ inputMethod })
  }

  handlePressToolbarCamera = () => {
    this.setState({
      isInputFocused: false,
      inputMethod: INPUT_METHOD.CUSTOM,
    })
  }

  handlePressToolbarLocation = () => {
    const { messages } = this.state

    navigator.geolocation.getCurrentPosition((position) => {
      const { coords: { latitude, longitude } } = position

      this.setState(
        {
          messages: [
            createLocationMessage({
              latitude,
              longitude
            }),
            ...messages
          ]
        }
      )
    })
  }

  handleChangeFocus = (isFocused) => {
    this.setState({ isInputFocused: isFocused })
  }

  handleSubmit = (text) => {
    const { messages } = this.state

    this.setState({
      messages: [createTextMessage(text), ...messages]
    })
  }

  handlePressMessage = ({ id, type }) => {
    switch (type) {
      case 'text':
        Alert.alert(
          'Delete message?',
          'Are you sure you want to permanently delete this message?',
          [
            {
              text: 'Cancel',
              style: 'cancel'
            },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: () => {
                const { messages } = this.state
                this.setState({
                  messages: messages.filter(
                    message => message.id != id
                  ),
                })
              }
            }
          ]
        )
        break
      case 'image':
        this.setState({
          fullscreenImageId: id,
          isInputFocused: false
        })
        break
      default:
        break
    }
  }

  handlePressImage = (uri) => {
    const { messages } = this.state

    this.setState({
      messages: [createImageMessage(uri), ...messages]
    })
  }

  renderMessageList = () => {
    const { messages } = this.state

    return (
      <View style={styles.content}>
        <MessageList
          messages={messages}
          onPressMessage={this.handlePressMessage}
        />
      </View>
    )
  }

  renderInputMethodEditor = () => {
    return (
      <View style={styles.inputMethodEditor}>
        <ImageGrid onPressImage={this.handlePressImage} />
      </View>
    )
  }

  renderToolbar = () => {
    const { isInputFocused } = this.state

    return (
      <View style={styles.toolbar}>
        <Toolbar
          isFocused={isInputFocused}
          onSubmit={this.handleSubmit}
          onChangeFocus={this.handleChangeFocus}
          onPressCamera={this.handlePressToolbarCamera}
          onPressLocation={this.handlePressToolbarLocation}
        />
      </View>
    )
  }

  render() {
    const { inputMethod } = this.state

    return (
      <View style={styles.container}>
        <Status />
        <MeasureLayout>
          {layout => (
            <KeyboardState layout={layout}>
              {keyboardInfo => (
                <MessagingContainer
                  {...keyboardInfo}
                  inputMethod={inputMethod}
                  onChangeInputMethod={this.handleChangeInputMethod}
                  renderInputMethodEditor={this.renderInputMethodEditor}
                >
                  {this.renderMessageList()}
                  {this.renderToolbar()}
                </MessagingContainer>
              )}
            </KeyboardState>
          )}
        </MeasureLayout>
        {this.renderFullscreenImage()}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
    backgroundColor: 'white',
  },
  inputMethodEditor: {
    flex: 1,
    backgroundColor: 'white',
  },
  toolbar: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.04)',
    backgroundColor: 'white'
  },
  fullscreenOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black',
    zIndex: 2,
  },
  fullscreenImage: {
    flex: 1,
    resizeMode: 'contain',
  }
})
