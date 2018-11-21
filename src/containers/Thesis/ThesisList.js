import React, { Component } from 'react'
import { connect } from 'react-redux'
import { arrayOf, func, bool, number } from 'prop-types'
import { thesisType, agreementType, attachmentType, councilmeetingType } from '../../util/types'
import LoadingIndicator from '../LoadingIndicator/index'
// import { makeGetFormatTheses } from '../../selectors/thesisList'
import ThesisListRow from './components/ThesisListRow'

export class ThesisList extends Component {
    constructor(props) {
        super(props)
        this.state = {
            filteredTheses: props.theses,
            formattedTheses: props.theses,
            selectedThesesIds: [],
            cover: true,
            markDone: false
        }
    }

    componentWillReceiveProps(newProps) {
        if (newProps.theses) {
            this.setState({
                filteredTheses: newProps.theses,
                formattedTheses: newProps.theses,
                selectedThesesIds: []
            })
        }
    }

    toggleThesis = thesis => () => {
        const selectedThesesIds = this.state.selectedThesesIds.includes(thesis.thesisId) ?
            this.state.selectedThesesIds.filter(id => id !== thesis.thesisId) :
            [...this.state.selectedThesesIds, thesis.thesisId]

        this.setState({ selectedThesesIds })
    };

    search = (event) => {
        if (!event.target.value) {
            this.setState({ filteredTheses: this.state.formattedTheses })
            return
        }
        const searchValue = event.target.value.toLowerCase()
        // if searchTerm is empty set filteredTheses = theses, else filter theses based on searchTerm
        const filteredTheses = this.state.filteredTheses
            .filter(thesis => Object.keys(thesis)
                .find(key => typeof thesis[key] === 'string' && thesis[key].toLowerCase().includes(searchValue)))
        this.setState({ filteredTheses })
    }

    sendDownloadSelected = () => {
        if (this.state.selectedThesesIds.length === 0)
            return

        const agreementsToPrint = this.props.agreements
            .filter(agreement => this.state.selectedThesesIds.includes(agreement.thesisId))
            .map(agreement => agreement.agreementId)

        const attachments = this.props.attachments
            .filter(attachment => agreementsToPrint.includes(attachment.agreementId))
            .filter(attachment => ['thesisFile', 'reviewFile'].includes(attachment.label))
            .sort((a, b) => {
                if (a.agreementId === b.agreementId)
                    return a.label === 'thesisFile' ? -1 : 1

                return a.agreementId - b.agreementId
            })
            .map(attachment => attachment.attachmentId)

        this.props.downloadSelected(this.state.cover ? ['cover', ...attachments] : attachments)

        if (this.state.markDone) {
            this.props.markPrinted(this.state.selectedThesesIds)
        }
    };

    toggleAll = () => {
        if (this.state.selectedThesesIds.length > 0) {
            this.setState({ selectedThesesIds: [] })
        } else {
            this.setState({ selectedThesesIds: this.props.theses.map(thesis => thesis.thesisId) })
        }
    };

    toggleCover = () => {
        this.setState({ cover: !this.state.cover })
    };

    toggleMarkDone = () => {
        this.setState({ markDone: !this.state.markDone })
    };

    renderButtons() {
        if (!this.props.showButtons) {
            return null
        }

        return (
            <div className="ui form">
                <div className="two fields" >
                    <div className="field">
                        <LoadingIndicator type="DOWNLOAD" />
                        <button className="ui orange button" onClick={this.sendDownloadSelected}>Download</button>
                        &nbsp;
                        <div className="ui toggle checkbox">
                            <input
                                type="checkbox"
                                checked={this.state.cover ? 'true' : ''}
                                onChange={this.toggleCover}
                            />
                            <label>Include cover</label>
                        </div>
                        &nbsp;
                        <div className="ui toggle checkbox">
                            <input
                                type="checkbox"
                                checked={this.state.markDone ? 'true' : ''}
                                onChange={this.toggleMarkDone}
                            />
                            <label>Mark print done</label>
                        </div>
                    </div>
                    <div className="field">
                        <button className="ui purple button" onClick={this.toggleAll}>Select all</button>
                    </div>
                </div>
            </div>
        )
    }

    render() {
        return (
            <div>
                {this.renderButtons()}
                <div className="ui fluid category search">
                    <div className="ui icon input">
                        <input className="prompt" type="text" placeholder="Filter theses" onChange={this.search} />
                        <i className="search icon" />
                    </div>
                </div>
                <table className="ui celled table">
                    <thead>
                        <tr>
                            {this.props.selectable || this.props.showButtons ? <th>Select</th> : null}
                            <th>Title</th>
                            <th>Author</th>
                            <th>Scheduled council meeting</th>
                            <th>Checked by author</th>
                            <th>No pending graders</th>
                            <th>Printed</th>
                            <th>Study module register requested</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.filteredTheses.map(thesis => (
                            <ThesisListRow
                                key={thesis.thesisId}
                                thesis={thesis}
                                councilmeeting={this.props.councilmeetings
                                    ? this.props.councilmeetings.find(councilmeeting => (
                                        councilmeeting.councilmeetingId === thesis.councilmeetingId))
                                    : undefined}
                                toggleThesis={this.toggleThesis}
                                showButtons={this.props.showButtons}
                                selectable={this.props.selectable}
                                selectedThesesIds={this.state.selectedThesesIds}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        )
    }
}

ThesisList.propTypes = {
    theses: arrayOf(thesisType).isRequired,
    councilmeetings: arrayOf(councilmeetingType).isRequired,
    downloadSelected: func.isRequired,
    agreements: arrayOf(agreementType).isRequired,
    attachments: arrayOf(attachmentType).isRequired,
    showButtons: bool.isRequired,
    markPrinted: func.isRequired,
    selectable: bool,
    councilMeetingId: number // eslint-disable-line
}

ThesisList.defaultProps = {
    selectable: false,
    councilMeetingId: null
}

// const getFormatTheses = makeGetFormatTheses()

const mapStateToProps = state => ({
    councilmeetings: state.councilmeetings,
    // theses: state.theses,
    agreements: state.agreements,
    attachments: state.attachments

})

export default connect(mapStateToProps)(ThesisList)
