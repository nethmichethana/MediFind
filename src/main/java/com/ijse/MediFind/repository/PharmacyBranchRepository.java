package com.ijse.MediFind.repository;

import com.ijse.MediFind.entity.PharmacyBranch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PharmacyBranchRepository extends JpaRepository<PharmacyBranch,Long>
{
}
