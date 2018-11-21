const reducer = (state = {}, action) => {
    switch (true) {
        case action.type === 'ROLE_UPDATE_ONE_SUCCESS':
            return Object.assign({}, state, {
                [action.type]: {
                    active: true,
                    type: 'success',
                    text: 'Tietojen päivitys onnistui'
                }
            })
        case action.type === 'USER_LOGOUT_SUCCESS':
            return Object.assign({}, state, {
                [action.type]: {
                    active: true,
                    type: 'success',
                    text: 'Uloskirjautuminen onnistui'
                }
            })
        case action.type === 'INVITE_ACCEPT_THESIS_SUCCESS':
            return Object.assign({}, state, {
                [action.type]: {
                    active: true,
                    type: 'success',
                    text: 'Thesis linked to user'
                }
            })
        case action.type === 'COUNCILMEETING_UPDATE_ONE_SUCCESS':
            return Object.assign({}, state, {
                [action.type]: {
                    active: true,
                    type: 'success',
                    text: 'Councilmeeting updated.'
                }
            })
        case action.type === 'PERSON_INVITE_ONE_SUCCESS':
            return Object.assign({}, state, {
                [action.type]: {
                    active: true,
                    type: 'success',
                    text: 'Invite sent.'
                }
            })
        case action.type === 'THESIS_SAVE_ONE_SUCCESS':
            return Object.assign({}, state, {
                [action.type]: {
                    active: true,
                    type: 'success',
                    text: 'Thesis saved.'
                }
            })
        case action.type === 'THESIS_UPDATE_ONE_SUCCESS':
            return Object.assign({}, state, {
                [action.type]: {
                    active: true,
                    type: 'success',
                    text: 'Thesis saved.'
                }
            })
        case action.type === 'USER_EMAIL_UPDATE_SUCCESS':
            return Object.assign({}, state, {
                [action.type]: {
                    active: true,
                    type: 'success',
                    text: 'Email updated'
                }
            })/*
        case action.type === 'USER_GRADER_REQUEST_SUCCESS':
            return Object.assign({}, state, {
                [action.type]: {
                    active: true,
                    type: 'success',
                    text: action.response.msg
                }
            }) */
        case action.type.includes('_FAILURE'): {
            const message = {}
            message[action.type] = {
                active: true,
                type: 'error',
                text: action.response.error ? action.response.error : action.type
            }
            return Object.assign({}, state, message)
        }
        case action.type.includes('SAVE_ONE_SUCCESS'): {
            const message = {}
            message[action.type] = {
                active: true,
                type: 'success',
                text: action.type
            }
            return Object.assign({}, state, message)
        }
        case action.type.includes('UPDATE_ONE_SUCCESS'): {
            const message = {}
            message[action.type] = {
                active: true,
                type: 'success',
                text: action.type
            }
            return Object.assign({}, state, message)
        }
        case action.type.includes('AGREEMENT_UPDATE_STUDY_MODULE_SUCCESS'): {
            const message = {}
            message[action.type] = {
                active: true,
                type: 'success',
                text: 'Study module registration status saved'
            }
            return Object.assign({}, state, message)
        }
        case action.type.includes('_ATTEMPT'): {
            const message = {}
            message[action.type] = {
                active: false,
                type: 'attempt',
                text: action.type
            }
            return Object.assign({}, state, message)
        }
        case action.type.includes('_SUCCESS'): {
            const message = {}
            const active = action.response.msg !== undefined
            message[action.type] = {
                active,
                type: 'success',
                text: action.response.msg ? action.response.msg : action.type
            }
            return Object.assign({}, state, message)
        }
        case action.type === 'EVENT_MESSAGE_CLEAR':
            return {}
        default:
            return state
    }
}

export default reducer
