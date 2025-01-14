/**
 * Copyright (C) 2018 Bonitasoft S.A.
 * Bonitasoft, 32 rue Gustave Eiffel - 38000 Grenoble
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2.0 of the License, or
 * (at your option) any later version.
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './List.css';
import { withTranslation } from 'react-i18next';

import {
  Panel,
  Table,
  Label,
  Glyphicon,
  OverlayTrigger,
  Tooltip
} from 'react-bootstrap';
import Pagination from 'react-js-pagination';

class List extends Component {
  constructor(props) {
    super(props);
    this.onRowClick = this.onRowClick.bind(this);
  }

  onRowClick(process) {
    this.props.handleProcessStart(process);
  }

  render() {
    const { processes, pagination, filters, onChangePage, t } = this.props;
    const { page, size, total } = pagination;

    var panelBodyContent;
    var paginationStatus = '';

    if (processes && processes.length > 0) {
      // indexes of first and last elements on the page
      const start = page * size;
      const end = start + (processes.length - 1);
      const of = t('of');
      paginationStatus = `${start + 1}-${end + 1} ${of} ${total}`;
      panelBodyContent = (
        <div>
          <Table striped hover>
            <thead>
              <tr>
                <th className="List-name" onClick={this.props.toggleOrder}>
                  <span>{t('Name')}</span>
                  <Glyphicon
                    glyph={
                      { ASC: 'chevron-up', DESC: 'chevron-down' }[filters.order]
                    }
                  />
                </th>
                <th>{t('Version')}</th>
                <th className="hidden-xs">{t('Categories')}</th>
                <th className="hidden-xs">{t('Description')}</th>
                <th>{t('Action')}</th>
              </tr>
            </thead>
            <tbody>
              {processes.map(process => (
                <OverlayTrigger
                  placement="top"
                  delayShow={500}
                  key={process.id}
                  overlay={
                    <Tooltip id={`new_case_${process.id}`}>
                      {t('Start a new case')}
                    </Tooltip>
                  }
                >
                  <tr
                    className="List-process start-process"
                    onClick={() => this.onRowClick(process)}
                  >
                    <td>{process.displayName}</td>
                    <td>{process.version}</td>
                    <td className="hidden-xs">
                      {process.categories.map(category => (
                        <Label key={category.id} bsStyle="default">
                          {category.displayName}
                        </Label>
                      ))}
                    </td>
                    <td className="hidden-xs">{process.description}</td>
                    <td className="process-action">
                      <Glyphicon glyph="play" />
                    </td>
                  </tr>
                </OverlayTrigger>
              ))}
            </tbody>
          </Table>
          <div className="List-pagination-bottom">
            <div>
              <p>{paginationStatus}</p>
            </div>
            <div className="List-pagination-bottom-element">
              <Pagination
                className="List-pagination-bottom"
                activePage={page + 1}
                itemsCountPerPage={size}
                totalItemsCount={total}
                pageRangeDisplayed={5}
                onChange={onChangePage}
              />
            </div>
          </div>
        </div>
      );
    } else {
      panelBodyContent = (
        <p className="text-muted animated fadeIn ng-binding">
          {t('No process to display')}
        </p>
      );
    }

    return (
      <Panel className="List">
        <Panel.Heading>
          <Panel.Title componentClass="h3">{t('List')}</Panel.Title>
          <div className="List-heading-right">
            <p className="List-pagination-top">{paginationStatus}</p>
          </div>
        </Panel.Heading>
        <Panel.Body>{panelBodyContent}</Panel.Body>
      </Panel>
    );
  }
}

const { string, oneOf, shape, arrayOf, objectOf, func } = PropTypes;

const categoryType = shape({
  createdBy: string,
  displayName: string,
  name: string,
  description: string,
  creation_date: string,
  id: string
});

const processType = shape({
  displayDescription: string,
  deploymentDate: string,
  displayName: string,
  categories: arrayOf(categoryType),
  name: string,
  description: string,
  deployedBy: string,
  id: string,
  activationState: oneOf(['ENABLED', 'DISABLED']),
  version: string,
  configurationState: oneOf([
    'UNRESOLVED',
    'RESOLVED',
    'DEACTIVATED',
    'ACTIVATED'
  ]),
  last_update_date: string,
  actorinitiatorid: string
});

List.propTypes = {
  processes: arrayOf(processType),
  filters: objectOf(string),
  toggleOrder: func
};

export default withTranslation()(List);
