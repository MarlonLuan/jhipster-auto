package com.mycompany.myapp.service.mapper;

import com.mycompany.myapp.domain.*;
import com.mycompany.myapp.service.dto.JobHistoryDTO;
import java.util.Objects;
import java.util.UUID;
import org.mapstruct.*;

/**
 * Mapper for the entity {@link JobHistory} and its DTO {@link JobHistoryDTO}.
 */
@Mapper(componentModel = "spring", uses = { JobMapper.class, DepartmentMapper.class, EmployeeMapper.class })
public interface JobHistoryMapper extends EntityMapper<JobHistoryDTO, JobHistory> {
    @Mapping(target = "job", source = "job", qualifiedByName = "id")
    @Mapping(target = "department", source = "department", qualifiedByName = "id")
    @Mapping(target = "employee", source = "employee", qualifiedByName = "id")
    JobHistoryDTO toDto(JobHistory s);

    default String map(UUID value) {
        return Objects.toString(value, null);
    }
}
