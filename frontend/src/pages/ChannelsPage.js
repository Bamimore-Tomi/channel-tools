// frontend/src/pages/ChannelsPage.js
import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import ChannelList from '../components/Channels/ChannelList';

const ChannelsPage = () => {
    return (
        <Container>
            <Row className="mb-4">
                <Col>
                    <h1>Programming Channels</h1>
                    <p className="lead">
                        Browse channels to find discussions on various programming topics or create your own.
                    </p>
                </Col>
            </Row>

            <ChannelList />
        </Container>
    );
};

export default ChannelsPage;