import path from 'path';
import fs from 'fs';
import React from 'react';
import Electron from 'electron';

import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import CardGroup from 'react-bootstrap/CardGroup';
import CardColumns from 'react-bootstrap/CardColumns';
import Card from 'react-bootstrap/Card';
import Spinner from 'react-bootstrap/Spinner';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

const CACHE_DIR = 'cache' //  for storing state snapshot files
const STATUS_COLOR_MAP = {
  running: 'warning',
  error: 'danger',
  success: 'success'
}

export class HomeTab extends React.Component {

  constructor(props) {
    super(props);
  }

  render () {
    // A button for each model
    const investJSON = this.props.investList;
    let investButtons = [];
    for (const model in investJSON) {
      investButtons.push(
        <Button key={model}
          value={investJSON[model]['internal_name']}
          onClick={this.props.investGetSpec}
          variant="outline-success">
          {model}
        </Button>
      );
    }

    return (
      <Row>
        <Col md={6}>
          <ButtonGroup vertical className="mt-2">
            {investButtons}
          </ButtonGroup>
        </Col>
        <Col md={6}>
          <LoadStateForm
            loadState={this.props.loadState}
            recentSessions={this.props.recentSessions}/>
        </Col>
      </Row>
    );
  }
}


class LoadStateForm extends React.Component {
  
  constructor(props) {
    super(props);
    this.selectFile = this.selectFile.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  selectFile(event) {
    const dialog = Electron.remote.dialog;
    // TODO: could add more filters to only show .json
    dialog.showOpenDialog({
      properties: ['openFile']
    }, (filepath) => {
      if (filepath[0]) {
        this.props.loadState(
          path.parse(path.basename(filepath[0])).name); // 0 is safe since we only allow 1 selection
      }
    })
  }

  handleClick(sessionName) {
    this.props.loadState(sessionName);
  }

  render() {

    // Buttons to load each recently saved state
    let recentButtons = [];
    this.props.recentSessions.forEach(session => {
      const name = session[0];
      const model = session[1].model;
      const workspaceDir = session[1].workspace.directory;
      const suffix = session[1].workspace.suffix;
      const status = session[1]['status'];
      const description = session[1]['description'];
      const datetime = session[1]['humanTime'];

      recentButtons.push(
        <Card className="text-left session-card w-100"
          as="button"
          key={name}
          value={name} // TODO: send the actual filename with json ext
          onClick={() => this.handleClick(name)}
          border={STATUS_COLOR_MAP[status] || 'dark'}>
          <Card.Body>
            <Card.Header>
              {model}  
              {status === 'running' && 
                <Spinner as='span' animation='border' size='sm' role='status' aria-hidden='true'/>
              }
            </Card.Header>
            <Card.Title>
              <em>Workspace: </em>{workspaceDir}
            </Card.Title>
            <Card.Title>
              { suffix && <em>Suffix: </em> }{suffix}
            </Card.Title>
            <Card.Text>{description || <em>no description</em>}</Card.Text>
          <Card.Footer className="text-muted">last modified: {datetime}</Card.Footer>
          </Card.Body>
        </Card>
      );
    });
    // Also a button to browse to a cached state file if it's not in recent list
    recentButtons.push(
      <Button
        key="browse"
        type="submit"
        variant="secondary"
        onClick={this.selectFile}>
        Browse for saved session
      </Button>
    );

    return (
      <React.Fragment>
        <div>
          Select Recent Session:
        </div>
        <CardGroup className='session-card-group'>
          {recentButtons}
        </CardGroup>
      </React.Fragment>
    );
  }
}
