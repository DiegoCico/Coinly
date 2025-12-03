import Container from "@cloudscape-design/components/container";
import Header from "@cloudscape-design/components/header";

interface WidgetProps {
  title: string;
  children: React.ReactNode;
}

export default function Widget({ title, children }: WidgetProps) {
  return (
    <Container
      header={<Header variant="h2" className="drag-handle">{title}</Header>}
      variant="default"
      footer={null}
    >
      {children}
    </Container>
  );
}
