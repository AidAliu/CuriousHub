import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import '../styles/Dashboard.css';

const AdminDashboard = () => {
  return (
    <Container>
      <Row className="mt-4">
        <Col md={4}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>User Management</Card.Title>
              <Card.Text>
                {/* Place your CRUD operations for users here */}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Project Management</Card.Title>
              <Card.Text>
                {/* Place your CRUD operations for projects here */}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Analytics</Card.Title>
            </Card.Body>
            <Card.Text>
              {}
            </Card.Text>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default AdminDashboard;
