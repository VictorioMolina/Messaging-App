import React from 'react'
import PropTypes from 'prop-types'
import * as Permissions from 'expo-permissions'
import * as MediaLibrary from 'expo-media-library'
import {
    Image,
    StyleSheet,
    TouchableOpacity,
} from 'react-native'

import Grid from './Grid'

const keyExtractor = ({ uri }) => uri

export default class ImageGrid extends React.Component {
    /* Member attributes */
    loading = false
    cursor = null

    static propTypes = {
        onPressImage: PropTypes.func,
    }

    static defaultProps = {
        onPressImage: () => { }
    }

    state = {
        images: [],
    }

    componentDidMount() {
        this.getImages()
    }

    getImages = async (after) => {
        if (this.loading) return

        this.loading = true

        const { status } = await Permissions.askAsync(
            Permissions.CAMERA_ROLL
        )

        if (status !== 'granted') {
            console.log('Camera roll permission denied')
            return
        }

        const results = await MediaLibrary.getAssetsAsync({
            first: 20,
            after,
        })
        // console.log(results)

        const { assets, hasNextPage, endCursor } = results

        this.setState({ images: this.state.images.concat(assets) }, () => {
            this.loading = false
            this.cursor = hasNextPage ? endCursor : null
        })
    }

    getNextImages = () => {
        // If there are no more pics to get, do nothing
        if (!this.cursor) return

        /*
            If we don't check the above condition,
            once we reach the final of the camera roll,
            the beginning will be loaded again
        */

        this.getImages(this.cursor)
    }

    renderItem = ({ item: { uri }, size, marginTop, marginLeft }) => {
        const { onPressImage } = this.props

        const style = {
            width: size,
            height: size,
            marginLeft,
            marginTop,
        }

        return (
            <TouchableOpacity
                key={uri}
                activeOpacity={0.75}
                onPress={() => onPressImage(uri)}
                style={style}
            >
                <Image source={{ uri }} style={styles.image} />
            </TouchableOpacity>
        )
    }

    render() {
        const { images } = this.state

        return (
            <Grid
                data={images}
                renderItem={this.renderItem}
                keyExtractor={keyExtractor}
                itemMargin={1}
                onEndReached={this.getNextImages}
            />
        )
    }
}

const styles = StyleSheet.create({
    image: {
        flex: 1,
    },
})