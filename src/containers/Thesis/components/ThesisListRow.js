import React from 'react'
import { arrayOf, number, bool, func } from 'prop-types'
import { Checkbox, Icon } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import { thesisType, councilmeetingType } from '../../../util/types'
import { formatDisplayDate } from '../../../util/common'

const renderStatusIcons = field =>
    (field ? <Icon color="green" name="checkmark" /> : <Icon color="red" name="remove" />)

const getAuthorName = (thesis) => {
    if (thesis.authors) {
        return thesis.authors.map((author) => {
            if (!author) return 'No name'
            return author.lastname && author.firstname ? `${author.lastname}, ${author.firstname}` : author.email
        })
    }
    return []
}

// This is a pretty basic check and could be improved.
const checkGraders = graders => graders.filter(grader => grader.roleRequestId).length < 1

const ThesisListRow = ({ councilmeeting, thesis, showButtons, selectable, toggleThesis, selectedThesesIds }) => {
    const authorName = getAuthorName(thesis)
    return (
        <tr>
            {selectable || showButtons ? (
                <td>
                    <Checkbox
                        checked={selectedThesesIds.includes(thesis.thesisId)}
                        onChange={toggleThesis(thesis)}
                        fitted
                    />
                </td>)
                : null}
            <td><Link to={`/thesis/${thesis.thesisId}`}>{thesis.title}</Link></td>
            <td>
                {authorName.join(' & ')}
            </td>
            <td>{councilmeeting ? formatDisplayDate(councilmeeting.date) : null}</td>
            <td>{renderStatusIcons(!authorName.some(author => author.includes('@')))}</td>
            <td>{renderStatusIcons(checkGraders(thesis.graders))}</td>
            <td>{renderStatusIcons(thesis.printDone)}</td>
            <td>{renderStatusIcons(thesis.studiesComplete)}</td>
        </tr>
    )
}

ThesisListRow.propTypes = {
    councilmeeting: councilmeetingType,
    thesis: thesisType.isRequired,
    toggleThesis: func.isRequired,
    showButtons: bool.isRequired,
    selectable: bool.isRequired,
    selectedThesesIds: arrayOf(number).isRequired
}

ThesisListRow.defaultProps = {
    councilmeeting: undefined
}

export default ThesisListRow
