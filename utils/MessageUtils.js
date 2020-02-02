import PropTypes from 'prop-types'
import uuidv4 from 'uuid/v4'

export const MessageShape = PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['text', 'image', 'location']),
    text: PropTypes.string,
    uri: PropTypes.string,
    coordinate: PropTypes.shape({
        latitude: PropTypes.number.isRequired,
        longitude: PropTypes.number.isRequired,
    }),
})

export function createTextMessage(text) {
    return {
        type: 'text',
        id: uuidv4(),
        text,
    }
}

export function createImageMessage(uri) {
    return {
        type: 'image',
        id: uuidv4(),
        uri,
    }
}

export function createLocationMessage(coordinate){
    return {
        type: 'location',
        id: uuidv4(),
        coordinate,
    }
}
