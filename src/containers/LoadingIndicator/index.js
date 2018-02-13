import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

export class LoadingIndicator extends Component {
    state = {
        loading: false
    }

    componentWillReceiveProps(newProps) {
        const { loading } = this.state
        const { messages } = newProps
        const { type } = this.props
        if (messages && messages.length > 0) {
            const messagesWithType = messages.filter(message => message.text.includes(type))
            if (messagesWithType.find(message => message.type !== 'attempt')) {
                if (loading) {
                    this.setState({ loading: false })
                }
            } else if (messagesWithType.find(message => message.type === 'attempt')) {
                if (!loading) {
                    this.setState({ loading: true })
                }
            }
        }
    }

    render() {
        const { loading } = this.state;
        if (!loading) {
            return null
        }
        return (
            <div>
                <div className="ui dimmer modals page transition visible active" />
                <div className="ui active modal" style={{ border: '2px solid pink', borderRadius: '7px' }}>
                    <div className="header">
                        Loading...
                    </div>
                    <div style={{ margin: '1%' }}>
                        <div className="description">
                            Imagine an icon that shows we are loading
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

const mapDispatchToProps = dispatch => ({
    clearMessages: () => dispatch({ type: 'EVENT_MESSAGE_CLEAR' })
});

const mapStateToProps = ({ eventMessage }) => ({
    messages: Object.keys(eventMessage)
        .map(key => Object.assign({ key }, eventMessage[key]))
});

const { string } = PropTypes;

LoadingIndicator.propTypes = {
    type: string.isRequired
};


export default connect(mapStateToProps, mapDispatchToProps)(LoadingIndicator);
