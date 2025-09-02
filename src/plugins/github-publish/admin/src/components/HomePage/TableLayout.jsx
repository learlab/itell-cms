import {Table, Thead, Tbody, Tr, Td, Th, Box, Typography, Checkbox, VisuallyHidden, Avatar, Flex, IconButton} from '@strapi/design-system';
import { ArrowRight } from '@strapi/icons';

const TableLayout = ({ children, entries}) => {
  // entries = []
  const ROW_COUNT = 10;
  const COL_COUNT = 5;

  return (
    <Box paddingLeft={0} paddingRight={0}>
      {children}
      <Table colCount={COL_COUNT} rowCount={ROW_COUNT}>
        <Thead>
          <Tr>
            <Th>
              <Typography variant="sigma">ID</Typography>
            </Th>
            <Th>
              <Typography variant="sigma">Status</Typography>
            </Th>
            <Th>
              <Typography variant="sigma">Conclusion</Typography>
            </Th>
            <Th>
              <Typography variant="sigma">Created At</Typography>
            </Th>
            <Th>
              <Typography variant="sigma">Logs</Typography>
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {entries.map((entry) => (
            <Tr key={entry.id}>
              <Td>
                <Typography textColor="neutral800">{entry.id}</Typography>
              </Td>
              <Td>
                <Typography textColor="neutral800">{entry.status}</Typography>
              </Td>
              <Td>
                <Typography textColor="neutral800">{entry.conclusion}</Typography>
              </Td>
              <Td>
                <Typography textColor="neutral800">{new Date(entry.createdAt).toLocaleString() }</Typography>
              </Td>
              <Td>
                <Flex>
                  <IconButton label="Download" borderWidth={0}>
                    <a href={`https://github.com/learlab/itell-rs/actions/runs/${entry.id}/job/${entry.jobId}`} target="_blank"
                       rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'white' }}>
                      <ArrowRight />
                    </a>
                  </IconButton>
                </Flex>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export { TableLayout };
